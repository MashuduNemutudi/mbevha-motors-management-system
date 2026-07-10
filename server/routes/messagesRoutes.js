/**
 * routes/messagesRoutes.js
 * Mounted at /api/messages in server.js
 *
 * POST   /api/messages          — public, rate-limited (10/15min per IP)
 * GET    /api/messages          — admin only
 * GET    /api/messages/stats    — admin only (dashboard badge)
 * PATCH  /api/messages/:id/read — admin only
 * DELETE /api/messages/:id      — admin only
 */

const express  = require('express');
const router   = express.Router();

const { protect }            = require('../middleware/authMiddleware');
const { contactFormLimiter } = require('../middleware/rateLimiter');
const {
  submit, getAll, getStats, markRead, remove,
} = require('../controllers/messagesController');

// Public — rate limited
router.post('/', contactFormLimiter, submit);

// Admin only — stats first to avoid /:id matching "stats"
router.get('/stats', protect, getStats);
router.get('/',      protect, getAll);

router.patch('/:id/read', protect, markRead);
router.delete('/:id',     protect, remove);

module.exports = router;
