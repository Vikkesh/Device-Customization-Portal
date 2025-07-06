import express from 'express';
import axios from 'axios';
import db from '../db.js';

const router = express.Router();

// GET endpoint - Get all project preview data for a specific project
router.get('/project/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;
    const { field } = req.query; // Optional field filter

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
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

    let query = 'SELECT * FROM project_preview WHERE project_id = ?';
    const params = [project_id];

    if (field) {
      query += ' AND field = ?';
      params.push(field);
    }

    // Use the S3 files endpoint to get files with fresh pre-signed URLs
    try {
      const s3Response = await axios.get(`${process.env.BASE_URL || 'http://localhost:8080'}/api/s3/files/${project_id}${field ? `?field=${field}` : ''}`);
      
      if (s3Response.data.success) {
        res.status(200).json({
          success: true,
          message: `Found ${s3Response.data.files.length} file(s)`,
          project_id,
          field: field || 'all',
          files: s3Response.data.files,
          count: s3Response.data.files.length
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'No files found',
          project_id,
          field: field || 'all',
          files: [],
          count: 0
        });
      }
    } catch (s3Error) {
      console.error('S3 files endpoint error:', s3Error.response?.data || s3Error.message);
      
      // Fallback to database query if S3 endpoint fails
      const [files] = await db.query(query, params);

      if (files.length === 0) {
        return res.status(200).json({
          success: true,
          message: field ? `No files found for field '${field}' in project ${project_id}` : `No files found for project ${project_id}`,
          project_id,
          field: field || 'all',
          files: [],
          count: 0
        });
      }

      res.status(200).json({
        success: true,
        message: `Found ${files.length} file(s) (using fallback)`,
        project_id,
        field: field || 'all',
        files,
        count: files.length
      });
    }

  } catch (error) {
    console.error('Retrieve project preview error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve project preview data', 
      error: error.message 
    });
  }
});

// DELETE endpoint - Delete entire project (all files)
router.delete('/project/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    // Get all files for the project
    const [projectFiles] = await db.query(
      'SELECT id, url FROM project_preview WHERE project_id = ?',
      [project_id]
    );

    if (projectFiles.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No files found for project ${project_id}`,
        project_id,
        files_deleted: 0
      });
    }

    // Extract S3 keys for deletion (stored in url column)
    const s3_keys = projectFiles.map(file => file.url);

    // Call S3 delete endpoint
    try {
      const s3Response = await axios.delete(`${process.env.BASE_URL || 'http://localhost:8080'}/api/s3/delete`, {
        data: { s3_keys }
      });

      console.log('S3 deletion response:', s3Response.data);
    } catch (s3Error) {
      console.error('S3 deletion failed:', s3Error.response?.data || s3Error.message);
      // Continue with database deletion even if S3 fails
    }

    // Delete from database
    const [deleteResult] = await db.query(
      'DELETE FROM project_preview WHERE project_id = ?',
      [project_id]
    );

    res.status(200).json({
      success: true,
      message: `Project ${project_id} files deleted successfully`,
      project_id,
      files_deleted: deleteResult.affectedRows,
      s3_deletion_attempted: true
    });

  } catch (error) {
    console.error('Project delete error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete project files', 
      error: error.message 
    });
  }
});

// DELETE endpoint - Delete all files of a particular field in a project
router.delete('/project/:project_id/field/:field', async (req, res) => {
  try {
    const { project_id, field } = req.params;

    if (!project_id || !field) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and field are required'
      });
    }

    // Get files for the specific field
    const [fieldFiles] = await db.query(
      'SELECT id, url FROM project_preview WHERE project_id = ? AND field = ?',
      [project_id, field]
    );

    if (fieldFiles.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No files found for field '${field}' in project ${project_id}`,
        project_id,
        field,
        files_deleted: 0
      });
    }

    // Extract S3 keys for deletion (stored in url column)
    const s3_keys = fieldFiles.map(file => file.url);

    // Call S3 delete endpoint
    try {
      const s3Response = await axios.delete(`${process.env.BASE_URL || 'http://localhost:8080'}/api/s3/delete`, {
        data: { s3_keys }
      });

      console.log('S3 deletion response:', s3Response.data);
    } catch (s3Error) {
      console.error('S3 deletion failed:', s3Error.response?.data || s3Error.message);
      // Continue with database deletion even if S3 fails
    }

    // Delete from database
    const [deleteResult] = await db.query(
      'DELETE FROM project_preview WHERE project_id = ? AND field = ?',
      [project_id, field]
    );

    res.status(200).json({
      success: true,
      message: `Field '${field}' files deleted successfully from project ${project_id}`,
      project_id,
      field,
      files_deleted: deleteResult.affectedRows,
      s3_deletion_attempted: true
    });

  } catch (error) {
    console.error('Field delete error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete field files', 
      error: error.message 
    });
  }
});

// DELETE endpoint - Delete a specific file by S3 key
router.delete('/file', async (req, res) => {
  try {
    const { s3_key, project_id, field } = req.body;

    if (!s3_key) {
      return res.status(400).json({
        success: false,
        message: 'S3 key is required'
      });
    }

    // Check if file exists in database using S3 key
    let query = 'SELECT id, project_id, field FROM project_preview WHERE url = ?';
    const params = [s3_key];

    if (project_id) {
      query += ' AND project_id = ?';
      params.push(project_id);
    }

    if (field) {
      query += ' AND field = ?';
      params.push(field);
    }

    const [fileCheck] = await db.query(query, params);

    if (fileCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found in database'
      });
    }

    const fileData = fileCheck[0];

    // Call S3 delete endpoint with S3 key
    try {
      const s3Response = await axios.delete(`${process.env.BASE_URL || 'http://localhost:8080'}/api/s3/delete`, {
        data: { s3_keys: [s3_key] } // Always send as array
      });

      console.log('S3 deletion response:', s3Response.data);
    } catch (s3Error) {
      console.error('S3 deletion failed:', s3Error.response?.data || s3Error.message);
      // Continue with database deletion even if S3 fails
    }

    // Delete from database
    const [deleteResult] = await db.query(
      'DELETE FROM project_preview WHERE url = ?',
      [s3_key]
    );

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      deleted_file: {
        s3_key,
        project_id: fileData.project_id,
        field: fileData.field
      },
      database_records_deleted: deleteResult.affectedRows,
      s3_deletion_attempted: true
    });

  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete file', 
      error: error.message 
    });
  }
});

export default router;
