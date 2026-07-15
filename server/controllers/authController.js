/**
 * controllers/authController.js
 * ─────────────────────────────────────────────────────────────
 * Handles administrator authentication.
 *
 * Routes:
 *   POST /api/auth/login   — validate credentials, return JWT
 *   GET  /api/auth/me      — return current admin from token
 * ─────────────────────────────────────────────────────────────
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * POST /api/auth/login
 * Body: { username, password }
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Basic presence check
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    // Fetch admin by username
    const { rows } = await db.query(
      'SELECT id, username, password_hash FROM admins WHERE username = $1',
      [username.trim()]
    );

    if (rows.length === 0) {
      // Generic message — do not reveal whether the username exists
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    const admin = rows[0];

    // Compare submitted password against stored bcrypt hash
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    // Sign JWT with admin id and username
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Requires: Authorization: Bearer <token>
 * Returns the current admin's profile from the decoded token.
 */
const getMe = async (req, res, next) => {
  try {
    // req.admin is set by the protect middleware
    const { rows } = await db.query(
      'SELECT id, username, created_at FROM admins WHERE id = $1',
      [req.admin.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.',
      });
    }

    res.status(200).json({
      success: true,
      admin: rows[0],
    });
  } catch (err) {
    next(err);
  }
};


/**
 * PUT /api/auth/change-password
 * Body: { currentPassword, newPassword }
 * Requires: Authorization: Bearer <token>
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });

    if (newPassword.length < 8)
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });

    if (currentPassword === newPassword)
      return res.status(400).json({ success: false, message: 'New password must be different from current password.' });

    const { rows } = await db.query(
      'SELECT id, password_hash FROM admins WHERE id = $1',
      [req.admin.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Account not found.' });

    const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!match)
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    const newHash = await bcrypt.hash(newPassword, 12);
    await db.query(
      'UPDATE admins SET password_hash = $1 WHERE id = $2',
      [newHash, req.admin.id]
    );

    res.status(200).json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (err) {
    next(err);
  }
};

// Re-export with the new function
module.exports = { login, getMe, changePassword };
