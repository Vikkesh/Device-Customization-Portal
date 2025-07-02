import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM projects');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get a single project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM projects WHERE project_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create a new project
router.post('/', async (req, res) => {
  try {
    const {
      customer_name,
      shipping_country,
      device_model,
      device_amount,
      project_description,
      project_status = 'Active',
      created_by,
    } = req.body;
    

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
    const num_active_projects = project_status === 'Active' ? active_projects + 1 : active_projects;

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
