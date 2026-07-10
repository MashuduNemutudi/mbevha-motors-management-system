/**
 * routes/dashboardRoutes.js
 * Mounted at /api/dashboard in server.js
 *
 * GET /api/dashboard/stats    — summary counts for stat cards
 * GET /api/dashboard/activity — recent activity log entries
 * GET /api/dashboard/charts   — data for category and availability charts
 */

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const db          = require('../config/db');

/* ── GET /api/dashboard/stats ───────────────────────────── */
router.get('/stats', protect, async (req, res, next) => {
  try {
    const [parts, gallery, messages] = await Promise.all([
      db.query(`
        SELECT COUNT(*)                                   AS total_parts,
               COUNT(*) FILTER (WHERE is_available = TRUE) AS available_parts
        FROM parts
      `),
      db.query(`SELECT COUNT(*) AS total_images FROM gallery`),
      db.query(`
        SELECT COUNT(*)                                   AS total_messages,
               COUNT(*) FILTER (WHERE is_read = FALSE)   AS unread_messages
        FROM messages
      `),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total_parts:      parseInt(parts.rows[0].total_parts),
        available_parts:  parseInt(parts.rows[0].available_parts),
        total_images:     parseInt(gallery.rows[0].total_images),
        total_messages:   parseInt(messages.rows[0].total_messages),
        unread_messages:  parseInt(messages.rows[0].unread_messages),
      },
    });
  } catch (err) {
    next(err);
  }
});

/* ── GET /api/dashboard/activity ────────────────────────── */
router.get('/activity', protect, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 15, 50);

    const { rows } = await db.query(
      `SELECT al.id, al.action, al.entity_type, al.description, al.created_at,
              a.username AS admin_username
       FROM   activity_logs al
       JOIN   admins a ON a.id = al.admin_id
       ORDER  BY al.created_at DESC
       LIMIT  $1`,
      [limit]
    );

    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

/* ── GET /api/dashboard/charts ──────────────────────────── */
router.get('/charts', protect, async (req, res, next) => {
  try {
    const [byCategory, availability, recentMessages] = await Promise.all([
      // Parts grouped by category
      db.query(`
        SELECT category, COUNT(*) AS count
        FROM   parts
        GROUP  BY category
        ORDER  BY count DESC
      `),
      // Available vs unavailable
      db.query(`
        SELECT is_available, COUNT(*) AS count
        FROM   parts
        GROUP  BY is_available
      `),
      // Last 7 days of messages (daily count)
      db.query(`
        SELECT DATE(created_at) AS day, COUNT(*) AS count
        FROM   messages
        WHERE  created_at >= NOW() - INTERVAL '7 days'
        GROUP  BY DATE(created_at)
        ORDER  BY day ASC
      `),
    ]);

    // Normalise availability data
    const avail = { available: 0, unavailable: 0 };
    availability.rows.forEach(r => {
      if (r.is_available) avail.available = parseInt(r.count);
      else                avail.unavailable = parseInt(r.count);
    });

    res.status(200).json({
      success: true,
      data: {
        partsByCategory: byCategory.rows.map(r => ({
          category: r.category,
          count:    parseInt(r.count),
        })),
        partsAvailability: avail,
        recentMessages: recentMessages.rows.map(r => ({
          day:   r.day,
          count: parseInt(r.count),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
