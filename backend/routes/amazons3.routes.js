import express from 'express';
import multer from 'multer';
import { S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import db from '../db.js';

const router = express.Router();

// Configure AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.S3_BUCKET_NAME;

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
  // Updated to include more audio and video formats
  const allowedExtensions = /jpeg|jpg|png|gif|bmp|webp|mp4|mov|avi|mkv|wmv|flv|webm|m4v|3gp|mp3|wav|aac|ogg|flac|wma|m4a|opus|txt|md|csv|pdf|doc|docx/;
  const allowedMimeTypes = /^(image\/(jpeg|jpg|png|gif|bmp|webp)|video\/(mp4|quicktime|x-msvideo|x-ms-wmv|x-flv|webm|3gpp)|audio\/(mpeg|wav|aac|ogg|flac|x-ms-wma|mp4|opus)|text\/(plain|markdown|csv)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document))$/;
  
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.test(file.mimetype);
  
  console.log('File validation:', {
    filename: file.originalname,
    mimetype: file.mimetype,
    extension: path.extname(file.originalname).toLowerCase(),
    extensionValid: extname,
    mimetypeValid: mimetype
  });
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    console.error('File type validation failed:', {
      filename: file.originalname,
      mimetype: file.mimetype,
      extension: path.extname(file.originalname).toLowerCase()
    });
    cb(new Error(`Invalid file type. File: ${file.originalname}, MIME: ${file.mimetype}`));
  }
}
});

// POST endpoint - Upload files to S3 and save to project_preview table
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    const { project_id, type, field } = req.body;
    const files = req.files;

    // Validation
    if (!project_id || !type || !field || !files || files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: project_id, type, field, or files' 
      });
    }

    // Verify project exists
    const [projectCheck] = await db.query(
      'SELECT project_id FROM projects WHERE project_id = ?',
      [project_id]
    );

    if (projectCheck.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    const uploadPromises = files.map(async (file) => {
      try {
        // Generate unique filename
        const fileExtension = path.extname(file.originalname);
        const uniqueFileName = `${project_id}/${field}/${uuidv4()}${fileExtension}`;
        
        // S3 upload using AWS SDK v3
        const uploadParams = {
          Bucket: bucketName,
          Key: uniqueFileName,
          Body: file.buffer,
          ContentType: file.mimetype,
          Metadata: {
            'original-name': file.originalname,
            'project-id': project_id.toString(),
            'field': field,
            'type': type
          }
        };

        // Use the Upload class for better performance
        const upload = new Upload({
          client: s3Client,
          params: uploadParams,
        });

        const uploadResult = await upload.done();
        
        // Store S3 key instead of URL in database
        await db.query(
          'INSERT INTO project_preview (project_id, filetype, url, field) VALUES (?, ?, ?, ?)',
          [project_id, type, uniqueFileName, field] // Store S3 key, not URL
        );

        return {
          success: true,
          filename: file.originalname,
          s3_key: uniqueFileName,
          size: file.size,
          type: file.mimetype
        };
      } catch (error) {
        console.error(`Failed to upload file ${file.originalname}:`, error);
        return {
          success: false,
          filename: file.originalname,
          error: error.message
        };
      }
    });

    const uploadResults = await Promise.all(uploadPromises);
    const successfulUploads = uploadResults.filter(result => result.success);
    const failedUploads = uploadResults.filter(result => !result.success);

    if (successfulUploads.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'All file uploads failed',
        failed_uploads: failedUploads
      });
    }

    res.status(200).json({
      success: true,
      message: `${successfulUploads.length} file(s) uploaded successfully`,
      project_id,
      field,
      type,
      uploaded_files: successfulUploads,
      failed_uploads: failedUploads,
      total_uploaded: successfulUploads.length,
      total_failed: failedUploads.length
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        message: 'File size too large (max 100MB)' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Upload failed', 
      error: error.message 
    });
  }
});

// GET endpoint - Generate fresh pre-signed URLs for files
router.get('/files/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;
    const { field } = req.query;

    let query = 'SELECT id, url, field, filetype FROM project_preview WHERE project_id = ?';
    const params = [project_id];

    if (field) {
      query += ' AND field = ?';
      params.push(field);
    }

    const [files] = await db.query(query, params);

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No files found'
      });
    }

    const urlPromises = files.map(async (file) => {
      try {
        // Generate fresh pre-signed URL from S3 key
        const getObjectCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: file.url, // This is actually the S3 key stored in 'url' field
        });
        
        const presignedUrl = await getSignedUrl(s3Client, getObjectCommand, {
          expiresIn: 3600, // 1 hour
        });

        return {
          id: file.id,
          field: file.field,
          filetype: file.filetype,
          url: presignedUrl,        // For display/download
          s3_key: file.url,         // For deletion - THIS IS KEY!
          expires_in: '1 hour'
        };
      } catch (error) {
        console.error(`Failed to generate presigned URL for file ${file.id}:`, error);
        return {
          id: file.id,
          field: file.field,
          s3_key: file.url,
          error: error.message
        };
      }
    });

    const urlResults = await Promise.all(urlPromises);

    res.status(200).json({
      success: true,
      project_id,
      files: urlResults
    });

  } catch (error) {
    console.error('File retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve files',
      error: error.message
    });
  }
});

// DELETE endpoint - Delete files from S3 by S3 keys
router.delete('/delete', async (req, res) => {
  try {
    const { s3_keys } = req.body;

    if (!s3_keys || !Array.isArray(s3_keys) || s3_keys.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'S3 keys array is required'
      });
    }

    const deletePromises = s3_keys.map(async (s3Key) => {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: s3Key
        });

        await s3Client.send(deleteCommand);
        
        return { 
          s3_key: s3Key, 
          success: true,
          message: 'Deleted successfully'
        };
      } catch (s3Error) {
        console.error(`Failed to delete S3 object for key ${s3Key}:`, s3Error);
        return { 
          s3_key: s3Key,
          success: false,
          error: s3Error.message 
        };
      }
    });

    const deleteResults = await Promise.all(deletePromises);
    const successfulDeletes = deleteResults.filter(result => result.success);
    const failedDeletes = deleteResults.filter(result => !result.success);

    res.status(200).json({
      success: true,
      message: `S3 delete operation completed`,
      total_requested: s3_keys.length,
      successful_deletes: successfulDeletes.length,
      failed_deletes: failedDeletes.length,
      results: deleteResults
    });

  } catch (error) {
    console.error('S3 delete error:', error);
    res.status(500).json({ 
      success: false,
      message: 'S3 delete operation failed', 
      error: error.message 
    });
  }
});
export default router;