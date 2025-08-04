import express from 'express';
import db from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all projects - role-based access
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role, id } = req.user;

    let rows;
    if (role === 'admin') {
      [rows] = await db.query(`
      SELECT 
        p.*,
        d.device_id 
      FROM projects p
      LEFT JOIN devices d ON p.device_model = d.device_name
      ORDER BY p.created_at DESC
    `);
    } else {
      [rows] = await db.query(`
      SELECT 
        p.*,
        d.device_id 
      FROM projects p
      LEFT JOIN devices d ON p.device_model = d.device_name
      WHERE p.created_by = ?
      ORDER BY p.created_at DESC
    `, [id]); 
   }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get a single project by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {role} = req.user;
    const [rows] = await db.query('SELECT * FROM projects WHERE project_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    if(role!=='admin' && rows[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You can only view your own projects.' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create a new project
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      customer_name,
      shipping_country,
      device_model,
      device_amount,
      project_description,
      project_status = 'Active',
    } = req.body;
    
    // Use authenticated user's ID
    const created_by = req.user.id;
    

    // Get total and active projects count
    const [[{ total_projects }]] = await db.query(
      'SELECT COUNT(*) as total_projects FROM projects WHERE customer_name = ?',
      [customer_name]
    );
    const [[{ active_projects }]] = await db.query(
      "SELECT COUNT(*) as active_projects FROM projects WHERE customer_name = ? AND project_status = 'Active'",
      [customer_name]
    );

    const num_total_projects = total_projects + 1;
    const num_active_projects = active_projects + 1;

    const sql = `INSERT INTO projects (customer_name, shipping_country, num_active_projects, num_total_projects, device_model, device_amount, created_by, project_status, project_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      customer_name,
      shipping_country,
      num_active_projects,
      num_total_projects,
      device_model,
      device_amount,
      created_by,
      project_status,
      project_description
    ];
    const [result] = await db.query(sql, values);

    // Update all projects for this customer with the new counts
    await db.query(
      'UPDATE projects SET num_active_projects = ?, num_total_projects = ? WHERE customer_name = ?',
      [num_active_projects, num_total_projects, customer_name]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});
// Change status of multiple projects (Admin only)
router.put('/change-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { projectIds, status } = req.body;

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ error: 'Project IDs array is required' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Validate status value
    const validStatuses = ['Active', 'Suspend', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: Active, Suspend, Completed' });
    }

    const [result] = await db.query(
      'UPDATE projects SET project_status = ? WHERE project_id IN (?)',
      [status, projectIds]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No projects found to update' });
    }

    // Update active project counts for affected customers
    if (status === 'Active' || status === 'Suspend' || status === 'Completed') {
      // Get all customers affected by this status change
      const [affectedProjects] = await db.query(
        'SELECT DISTINCT customer_name FROM projects WHERE project_id IN (?)',
        [projectIds]
      );

      // Update counts for each affected customer
      for (const project of affectedProjects) {
        const [[{ active_count }]] = await db.query(
          "SELECT COUNT(*) as active_count FROM projects WHERE customer_name = ? AND project_status = 'Active'",
          [project.customer_name]
        );
        
        await db.query(
          'UPDATE projects SET num_active_projects = ? WHERE customer_name = ?',
          [active_count, project.customer_name]
        );
      }
    }

    res.json({ 
      success: true, 
      message: `Successfully changed status to ${status} for ${result.affectedRows} project(s)`,
      updatedCount: result.affectedRows
    });
  } catch (err) {
    console.error('Error changing project status:', err);
    res.status(500).json({ error: 'Failed to change project status' });
  }
});
// Update a project
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;
    const { customer_name, device_amount, project_description, device_model } = req.body;

    // Check if project exists and user has access
    const [existingProject] = await db.query('SELECT * FROM projects WHERE project_id = ?', [id]);
    if (existingProject.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (role !== 'admin' && existingProject[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You can only update your own projects.' });
    }

    // Update the project
    const [result] = await db.query(
      'UPDATE projects SET customer_name = ?, device_amount = ?, project_description = ?, device_model = ? WHERE project_id = ?',
      [customer_name, device_amount, project_description, device_model, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ 
      success: true,
      message: 'Project updated successfully'
    });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Bulk delete projects
router.delete('/bulk-delete', authenticateToken, async (req, res) => {
  try {
    const { projectIds } = req.body;
    const { role, id } = req.user;

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ error: 'Project IDs array is required' });
    }

    let deleteQuery;
    let deleteParams;

    // If admin, can delete any projects
    if (role === 'admin') {
      deleteQuery = 'DELETE FROM projects WHERE project_id IN (?)';
      deleteParams = [projectIds];
    } else {
      // Regular users can only delete their own projects
      deleteQuery = 'DELETE FROM projects WHERE project_id IN (?) AND created_by = ?';
      deleteParams = [projectIds, id];
    }

    const [result] = await db.query(deleteQuery, deleteParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No projects found to delete or access denied' });
    }

    res.json({ 
      success: true, 
      message: `Successfully deleted ${result.affectedRows} project(s)`,
      deletedCount: result.affectedRows
    });
  } catch (err) {
    console.error('Error deleting projects:', err);
    res.status(500).json({ error: 'Failed to delete projects' });
  }
});



export default router;
