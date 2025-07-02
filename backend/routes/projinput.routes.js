import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET endpoint - Get all project input data for a specific project
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

    let query = 'SELECT * FROM project_inputs WHERE project_id = ?';
    const params = [project_id];

    if (field) {
      query += ' AND field = ?';
      params.push(field);
    }

    query += ' ORDER BY created_at DESC';

    const [inputs] = await db.query(query, params);

    if (inputs.length === 0) {
      return res.status(200).json({
        success: true,
        message: field ? `No inputs found for field '${field}' in project ${project_id}` : `No inputs found for project ${project_id}`,
        project_id,
        field: field || 'all',
        inputs: [],
        count: 0
      });
    }

    res.status(200).json({
      success: true,
      message: `Found ${inputs.length} input(s)`,
      project_id,
      field: field || 'all',
      inputs,
      count: inputs.length
    });

  } catch (error) {
    console.error('Retrieve project inputs error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve project input data', 
      error: error.message 
    });
  }
});

// POST endpoint - Add new project input
router.post('/add', async (req, res) => {
  try {
    const { project_id, field, value } = req.body;

    if (!project_id || !field || value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, field, and value are required'
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

    // Check if field already exists for this project (optional: update vs create new)
    const [existingInput] = await db.query(
      'SELECT id FROM project_inputs WHERE project_id = ? AND field = ?',
      [project_id, field]
    );

    let result;
    let operation;

    if (existingInput.length > 0) {
      // Update existing input
      [result] = await db.query(
        'UPDATE project_inputs SET value = ? WHERE project_id = ? AND field = ?',
        [value, project_id, field]
      );
      operation = 'updated';
    } else {
      // Create new input
      [result] = await db.query(
        'INSERT INTO project_inputs (project_id, field, value) VALUES (?, ?, ?)',
        [project_id, field, value]
      );
      operation = 'created';
    }

    res.status(200).json({
      success: true,
      message: `Project input ${operation} successfully`,
      project_id,
      field,
      value,
      operation,
      affected_rows: result.affectedRows
    });

  } catch (error) {
    console.error('Add project input error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add project input', 
      error: error.message 
    });
  }
});

// DELETE endpoint - Delete entire project inputs
router.delete('/project/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    // Check if project has any inputs
    const [inputCheck] = await db.query(
      'SELECT COUNT(*) as count FROM project_inputs WHERE project_id = ?',
      [project_id]
    );

    if (inputCheck[0].count === 0) {
      return res.status(200).json({
        success: true,
        message: `No inputs found for project ${project_id}`,
        project_id,
        inputs_deleted: 0
      });
    }

    // Delete all inputs for the project
    const [deleteResult] = await db.query(
      'DELETE FROM project_inputs WHERE project_id = ?',
      [project_id]
    );

    res.status(200).json({
      success: true,
      message: `Project ${project_id} inputs deleted successfully`,
      project_id,
      inputs_deleted: deleteResult.affectedRows
    });

  } catch (error) {
    console.error('Project inputs delete error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete project inputs', 
      error: error.message 
    });
  }
});

// DELETE endpoint - Delete all inputs of a particular field in a project
router.delete('/project/:project_id/field/:field', async (req, res) => {
  try {
    const { project_id, field } = req.params;

    if (!project_id || !field) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and field are required'
      });
    }

    // Check if field exists for this project
    const [fieldCheck] = await db.query(
      'SELECT COUNT(*) as count FROM project_inputs WHERE project_id = ? AND field = ?',
      [project_id, field]
    );

    if (fieldCheck[0].count === 0) {
      return res.status(200).json({
        success: true,
        message: `No inputs found for field '${field}' in project ${project_id}`,
        project_id,
        field,
        inputs_deleted: 0
      });
    }

    // Delete inputs for the specific field
    const [deleteResult] = await db.query(
      'DELETE FROM project_inputs WHERE project_id = ? AND field = ?',
      [project_id, field]
    );

    res.status(200).json({
      success: true,
      message: `Field '${field}' inputs deleted successfully from project ${project_id}`,
      project_id,
      field,
      inputs_deleted: deleteResult.affectedRows
    });

  } catch (error) {
    console.error('Field inputs delete error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete field inputs', 
      error: error.message 
    });
  }
});

// DELETE endpoint - Delete a specific input entry
router.delete('/entry', async (req, res) => {
  try {
    const { project_id, field, value } = req.body;

    if (!project_id || !field) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and field are required'
      });
    }

    let query = 'DELETE FROM project_inputs WHERE project_id = ? AND field = ?';
    const params = [project_id, field];

    // If value is provided, delete specific entry with that value
    if (value !== undefined && value !== null) {
      query += ' AND value = ?';
      params.push(value);
    }

    const [deleteResult] = await db.query(query, params);

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: value !== undefined ? 
          `No input found with the specified value for field '${field}' in project ${project_id}` :
          `No inputs found for field '${field}' in project ${project_id}`
      });
    }

    res.status(200).json({
      success: true,
      message: `Input entry deleted successfully`,
      project_id,
      field,
      value: value || 'all values for field',
      inputs_deleted: deleteResult.affectedRows
    });

  } catch (error) {
    console.error('Input entry delete error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete input entry', 
      error: error.message 
    });
  }
});

export default router;
