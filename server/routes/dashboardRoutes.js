/**
 * routes/dashboardRoutes.js
 * Mounted at /api/dashboard in server.js
 *
 * GET /api/dashboard/stats    — summary counts for all stat cards
 * GET /api/dashboard/activity — recent activity log entries
 * GET /api/dashboard/charts   — chart data (categories, availability, messages)
 */

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const db          = require('../config/db');

/* ── GET /api/dashboard/stats ───────────────────────────── */
router.get('/stats', protect, async (req, res, next) => {
  try {
    const [parts, gallery, messages, quotations, invoices] = await Promise.all([

      db.query(`
        SELECT COUNT(*)                                     AS total_parts,
               COUNT(*) FILTER (WHERE is_available = TRUE) AS available_parts
        FROM parts
      `),

      db.query(`SELECT COUNT(*) AS total_images FROM gallery`),

      db.query(`
        SELECT COUNT(*)                                   AS total_messages,
               COUNT(*) FILTER (WHERE is_read = FALSE)   AS unread_messages
        FROM messages
      `),

      db.query(`
        SELECT COUNT(*)                                            AS total_quotations,
               COUNT(*) FILTER (WHERE status = 'draft')           AS draft_quotations,
               COUNT(*) FILTER (WHERE status = 'sent')            AS sent_quotations,
               COUNT(*) FILTER (WHERE status = 'approved')        AS approved_quotations,
               COUNT(*) FILTER (WHERE status = 'converted')       AS converted_quotations
        FROM quotations
      `),

      db.query(`
        SELECT COUNT(*)                                               AS total_invoices,
               COUNT(*) FILTER (WHERE payment_status = 'pending')   AS pending_invoices,
               COUNT(*) FILTER (WHERE payment_status = 'partial')   AS partial_invoices,
               COUNT(*) FILTER (WHERE payment_status = 'paid')      AS paid_invoices,
               COALESCE(
                 SUM(total_amount) FILTER (WHERE payment_status = 'paid'
                   AND DATE_TRUNC('month', invoice_date) = DATE_TRUNC('month', CURRENT_DATE)
                 ), 0
               ) AS monthly_revenue
        FROM invoices
      `),

    ]);

    res.status(200).json({
      success: true,
      data: {
        /* Parts */
        total_parts:         parseInt(parts.rows[0].total_parts),
        available_parts:     parseInt(parts.rows[0].available_parts),
        /* Gallery */
        total_images:        parseInt(gallery.rows[0].total_images),
        /* Messages */
        total_messages:      parseInt(messages.rows[0].total_messages),
        unread_messages:     parseInt(messages.rows[0].unread_messages),
        /* Quotations */
        total_quotations:    parseInt(quotations.rows[0].total_quotations),
        draft_quotations:    parseInt(quotations.rows[0].draft_quotations),
        sent_quotations:     parseInt(quotations.rows[0].sent_quotations),
        approved_quotations: parseInt(quotations.rows[0].approved_quotations),
        converted_quotations:parseInt(quotations.rows[0].converted_quotations),
        /* Invoices */
        total_invoices:      parseInt(invoices.rows[0].total_invoices),
        pending_invoices:    parseInt(invoices.rows[0].pending_invoices),
        partial_invoices:    parseInt(invoices.rows[0].partial_invoices),
        paid_invoices:       parseInt(invoices.rows[0].paid_invoices),
        monthly_revenue:     parseFloat(invoices.rows[0].monthly_revenue),
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
    const [byCategory, availability, recentMessages, quotationsByStatus, recentQuotations, recentInvoices] = await Promise.all([

      // Parts by category
      db.query(`
        SELECT category, COUNT(*) AS count
        FROM   parts
        GROUP  BY category
        ORDER  BY count DESC
      `),

      // Parts availability
      db.query(`
        SELECT is_available, COUNT(*) AS count
        FROM   parts
        GROUP  BY is_available
      `),

      // Messages per day (last 7 days)
      db.query(`
        SELECT DATE(created_at) AS day, COUNT(*) AS count
        FROM   messages
        WHERE  created_at >= NOW() - INTERVAL '7 days'
        GROUP  BY DATE(created_at)
        ORDER  BY day ASC
      `),

      // Quotations by status
      db.query(`
        SELECT status, COUNT(*) AS count
        FROM   quotations
        GROUP  BY status
        ORDER  BY count DESC
      `),

      // Recent quotations (last 5)
      db.query(`
        SELECT quotation_number, customer_name, total_amount, status, created_at
        FROM   quotations
        ORDER  BY created_at DESC
        LIMIT  5
      `),

      // Recent invoices (last 5)
      db.query(`
        SELECT invoice_number, customer_name, total_amount, payment_status, invoice_date
        FROM   invoices
        ORDER  BY created_at DESC
        LIMIT  5
      `),
    ]);

    // Normalise availability
    const avail = { available: 0, unavailable: 0 };
    availability.rows.forEach(r => {
      if (r.is_available) avail.available   = parseInt(r.count);
      else                avail.unavailable = parseInt(r.count);
    });

    res.status(200).json({
      success: true,
      data: {
        partsByCategory:     byCategory.rows.map(r => ({ category: r.category, count: parseInt(r.count) })),
        partsAvailability:   avail,
        recentMessages:      recentMessages.rows.map(r => ({ day: r.day, count: parseInt(r.count) })),
        quotationsByStatus:  quotationsByStatus.rows.map(r => ({ status: r.status, count: parseInt(r.count) })),
        recentQuotations:    recentQuotations.rows,
        recentInvoices:      recentInvoices.rows,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
