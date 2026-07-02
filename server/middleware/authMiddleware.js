/**
 * middleware/authMiddleware.js
 * ─────────────────────────────────────────────────────────────
 * JWT authentication middleware for protected admin routes.
 *
 * How it works:
 *   1. Reads the Authorization header: "Bearer <token>"
 *   2. Verifies the token signature and expiry using JWT_SECRET
 *   3. Attaches the decoded payload to req.admin so downstream
 *      controllers know who is making the request
 *   4. Calls next() to continue, or returns 401 if invalid
 *
 * Usage in routes:
 *   const { protect } = require('../middleware/authMiddleware');
 *   router.get('/admin/resource', protect, controller.getResource);
 * ─────────────────────────────────────────────────────────────
 */

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check header exists and uses Bearer scheme
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach admin info to request for use in controllers
    req.admin = decoded;
    next();
  } catch (err) {
    // Handle specific JWT errors with clear messages
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.',
    });
  }
};

module.exports = { protect };
