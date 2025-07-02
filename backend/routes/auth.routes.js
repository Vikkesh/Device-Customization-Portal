import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js'; 

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'; // Use environment variable in production

// Registration route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  try {
    // Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT * FROM user_profile WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const [result] = await db.query(
      'INSERT INTO user_profile (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'client']
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { loginIdentifier, password } = req.body; // loginIdentifier can be username or email

  if (!loginIdentifier || !password) {
    return res.status(400).json({ message: 'Login identifier and password are required.' });
  }

  try {
    // Find user by username or email
    const [users] = await db.query(
      'SELECT id, username, email, password, role FROM user_profile WHERE username = ? OR email = ?',
      [loginIdentifier, loginIdentifier]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Create and assign token
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role }, 
        jwtSecret, 
        { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.json({ 
        message: 'Login successful', 
        token, 
        user: { id: user.id, username: user.username, email: user.email, role: user.role } 
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

export default router;
