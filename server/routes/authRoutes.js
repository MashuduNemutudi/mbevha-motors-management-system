/**
 * routes/authRoutes.js
 * ─────────────────────────────────────────────────────────────
 * Authentication routes.
 * Mounted at /api/auth in server.js
 * ─────────────────────────────────────────────────────────────
 */

const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.post('/login', login);

// Protected — requires valid JWT
router.get('/me', protect, getMe);

module.exports = router;
