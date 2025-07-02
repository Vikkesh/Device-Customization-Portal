import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get user profile and project stats
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user info
    const [userRows] = await db.query('SELECT username, id FROM user_profile WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userRows[0];

    // Get projects created count
    const [[{ projects_created }]] = await db.query(
      'SELECT COUNT(*) as projects_created FROM projects WHERE created_by = ?',
      [userId]
    );

    // Get total devices shipping from active projects
    const [[{ total_devices }]] = await db.query(
      "SELECT SUM(device_amount) as total_devices FROM projects WHERE created_by = ? AND project_status = 'Active'",
      [userId]
    );

    res.json({
      username: user.username,
      user_id: user.id,
      projects_created,
      total_devices: total_devices || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

export default router;
