import express from 'express';
import db from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all devices - Available to all authenticated users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT device_id, device_name, device_type, device_description FROM devices ORDER BY device_name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Get device by ID - Available to all authenticated users
router.get('/:deviceId', authenticateToken, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const [rows] = await db.query('SELECT device_id, device_name, device_type, device_description FROM devices WHERE device_id = ?', [deviceId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

// Create new device - Admin only
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { device_name, device_type, device_description } = req.body;

    if (!device_name || !device_type) {
      return res.status(400).json({ error: 'Device name and type are required' });
    }

    const [result] = await db.query(
      'INSERT INTO devices (device_name, device_type, device_description) VALUES (?, ?, ?)',
      [device_name, device_type, device_description || '']
    );

    res.status(201).json({ 
      message: 'Device created successfully',
      device_id: result.insertId,
      device_name,
      device_type,
      device_description
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Device with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create device' });
    }
  }
});

// Update device - Admin only
router.put('/:deviceId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { device_name, device_type, device_description } = req.body;

    if (!device_name || !device_type) {
      return res.status(400).json({ error: 'Device name and type are required' });
    }

    const [result] = await db.query(
      'UPDATE devices SET device_name = ?, device_type = ?, device_description = ? WHERE device_id = ?',
      [device_name, device_type, device_description || '', deviceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ 
      message: 'Device updated successfully',
      device_id: deviceId,
      device_name,
      device_type,
      device_description
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// Delete device - Admin only
router.delete('/:deviceId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const [result] = await db.query('DELETE FROM devices WHERE device_id = ?', [deviceId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ 
      message: 'Device deleted successfully',
      deletedCount: result.affectedRows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

export default router;
