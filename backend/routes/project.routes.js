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

export default router;
