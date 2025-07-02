import express from 'express';
import multer from 'multer';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import db from '../db.js';

const router = express.Router();

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME;

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mp3|wav|txt|md|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
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
        
        // S3 upload parameters
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

        // Upload to S3
        const uploadResult = await s3.upload(uploadParams).promise();
        
        // Save to project_preview table
        await db.query(
          'INSERT INTO project_preview (project_id, filetype, url, field) VALUES (?, ?, ?, ?)',
          [project_id, type, uploadResult.Location, field]
        );

        return {
          success: true,
          filename: file.originalname,
          s3_url: uploadResult.Location,
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

// DELETE endpoint - Delete files from S3 by URLs
router.delete('/delete', async (req, res) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'URLs array is required'
      });
    }

    const deletePromises = urls.map(async (url) => {
      try {
        // Extract S3 key from URL
        const urlObj = new URL(url);
        const s3Key = urlObj.pathname.substring(1); // Remove leading slash

        const deleteParams = {
          Bucket: bucketName,
          Key: s3Key
        };

        await s3.deleteObject(deleteParams).promise();
        
        return { 
          url,
          s3_key: s3Key, 
          success: true,
          message: 'Deleted successfully'
        };
      } catch (s3Error) {
        console.error(`Failed to delete S3 object for URL ${url}:`, s3Error);
        return { 
          url,
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
      total_requested: urls.length,
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
