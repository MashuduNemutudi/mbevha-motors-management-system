/**
 * routes/messagesRoutes.js
 * Mounted at /api/messages
 *
 * Endpoints:
 *   POST   /api/messages            — submit contact form (public, rate-limited)
 *   GET    /api/messages            — list all messages (admin only)
 *   PATCH  /api/messages/:id/read   — mark as read (admin only)
 *   DELETE /api/messages/:id        — delete message (admin only)
 *
 * TODO (Phase 6): Implement all routes with rate limiter on POST.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { contactFormLimiter } = require('../middleware/rateLimiter');

router.post('/',              contactFormLimiter, (req, res) => res.json({ success: true, message: 'Contact form — coming in Phase 6' }));
router.get('/',               protect, (req, res) => res.json({ success: true, data: [], message: 'Messages list — coming in Phase 6' }));
router.patch('/:id/read',     protect, (req, res) => res.json({ success: true, message: 'Mark read — coming in Phase 6' }));
router.delete('/:id',         protect, (req, res) => res.json({ success: true, message: 'Delete message — coming in Phase 6' }));

module.exports = router;
