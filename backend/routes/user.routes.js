import express from 'express';
import db from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (excluding password and created_at) - Admin only
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, email, role FROM user_profile');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user profile and project stats
router.get('/:userId/stats', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;

    // Users can only access their own stats unless they're admin
    if (requestingUser.role !== 'admin' && requestingUser.id != userId) {
      return res.status(403).json({ error: 'Access denied. You can only view your own information.' });
    }

    // Get user info
    const [userRows] = await db.query('SELECT username, email, id FROM user_profile WHERE id = ?', [userId]);
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
      email: user.email,
      projects_created,
      total_devices: total_devices || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Bulk delete users - Admin only
router.delete('/bulk-delete', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    // Prevent admin from deleting themselves
    if (userIds.includes(req.user.id)) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Create placeholders for the query
    const placeholders = userIds.map(() => '?').join(',');
    
    // Then delete the users
    const [result] = await db.query(`DELETE FROM user_profile WHERE id IN (${placeholders})`, userIds);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No users found to delete' });
    }

    res.json({ 
      message: `Successfully deleted ${result.affectedRows} user(s)`,
      deletedCount: result.affectedRows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete users' });
  }
});

// Toggle admin role for multiple users - Admin only
router.patch('/toggle-admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    // Prevent admin from changing their own role
    if (userIds.includes(req.user.id)) {
      return res.status(400).json({ error: 'You cannot change your own role' });
    }

    // Get current roles for these users
    const placeholders = userIds.map(() => '?').join(',');
    const [users] = await db.query(`SELECT id, role FROM user_profile WHERE id IN (${placeholders})`, userIds);

    if (users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    // Toggle roles: admin -> client, client -> admin
    const updatePromises = users.map(user => {
      const newRole = user.role === 'admin' ? 'client' : 'admin';
      return db.query('UPDATE user_profile SET role = ? WHERE id = ?', [newRole, user.id]);
    });

    await Promise.all(updatePromises);

    res.json({ 
      message: `Successfully updated roles for ${users.length} user(s)`,
      updatedCount: users.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user roles' });
  }
});

export default router;
