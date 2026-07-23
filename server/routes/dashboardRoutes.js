/**
 * routes/dashboardRoutes.js
 * Each query runs independently — one failing column won't crash all stats.
 */

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const db          = require('../config/db');

/* safe parseInt helper */
const n = (v) => parseInt(v) || 0;
const f = (v) => parseFloat(v) || 0;

/* ── GET /api/dashboard/stats ───────────────────────────── */
router.get('/stats', protect, async (req, res, next) => {
  try {
    /* Run every query independently — a missing column in one table
       will not crash the whole stats endpoint */
    const safeQuery = async (sql, fallback = {}) => {
      try { const r = await db.query(sql); return r.rows[0]; }
      catch { return fallback; }
    };

    const [parts, gallery, messages, quotations, invoices, jobCards] = await Promise.all([

      safeQuery(`
        SELECT COUNT(*)                                     AS total_parts,
               COUNT(*) FILTER (WHERE is_available = TRUE) AS available_parts
        FROM parts
      `, { total_parts: 0, available_parts: 0 }),

      safeQuery(
        `SELECT COUNT(*) AS total_images FROM gallery`,
        { total_images: 0 }
      ),

      safeQuery(`
        SELECT COUNT(*)                                 AS total_messages,
               COUNT(*) FILTER (WHERE is_read = FALSE) AS unread_messages
        FROM messages
      `, { total_messages: 0, unread_messages: 0 }),

      safeQuery(`
        SELECT COUNT(*)                                         AS total_quotations,
               COUNT(*) FILTER (WHERE status = 'draft')        AS draft_quotations,
               COUNT(*) FILTER (WHERE status = 'sent')         AS sent_quotations,
               COUNT(*) FILTER (WHERE status = 'approved')     AS approved_quotations,
               COUNT(*) FILTER (WHERE status = 'converted')    AS converted_quotations
        FROM quotations
      `, { total_quotations:0, draft_quotations:0, sent_quotations:0, approved_quotations:0, converted_quotations:0 }),

      /* Use created_at for monthly revenue — safe whether or not
         migration 002 (which adds invoice_date) has been applied */
      safeQuery(`
        SELECT COUNT(*)                                              AS total_invoices,
               COUNT(*) FILTER (WHERE payment_status = 'pending')  AS pending_invoices,
               COUNT(*) FILTER (WHERE payment_status = 'partial')  AS partial_invoices,
               COUNT(*) FILTER (WHERE payment_status = 'paid')     AS paid_invoices,
               COALESCE(
                 SUM(total_amount) FILTER (
                   WHERE payment_status = 'paid'
                   AND   DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
                 ), 0
               ) AS monthly_revenue
        FROM invoices
      `, { total_invoices:0, pending_invoices:0, partial_invoices:0, paid_invoices:0, monthly_revenue:0 }),

      safeQuery(
        `SELECT COUNT(*) AS total_job_cards,
                COUNT(*) FILTER (WHERE status = 'open')       AS open_job_cards,
                COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_job_cards,
                COUNT(*) FILTER (WHERE status = 'completed')   AS completed_job_cards
         FROM job_cards`,
        { total_job_cards:0, open_job_cards:0, in_progress_job_cards:0, completed_job_cards:0 }
      ),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total_parts:           n(parts.total_parts),
        available_parts:       n(parts.available_parts),
        total_images:          n(gallery.total_images),
        total_messages:        n(messages.total_messages),
        unread_messages:       n(messages.unread_messages),
        total_quotations:      n(quotations.total_quotations),
        draft_quotations:      n(quotations.draft_quotations),
        sent_quotations:       n(quotations.sent_quotations),
        approved_quotations:   n(quotations.approved_quotations),
        converted_quotations:  n(quotations.converted_quotations),
        total_invoices:        n(invoices.total_invoices),
        pending_invoices:      n(invoices.pending_invoices),
        partial_invoices:      n(invoices.partial_invoices),
        paid_invoices:         n(invoices.paid_invoices),
        monthly_revenue:       f(invoices.monthly_revenue),
        total_job_cards:       n(jobCards.total_job_cards),
        open_job_cards:        n(jobCards.open_job_cards),
      },
    });
  } catch (err) {
    // Never send 500 — return zeroed stats so dashboard still renders
    res.status(200).json({ success: true, data: {
      total_parts:0, available_parts:0, total_images:0,
      total_messages:0, unread_messages:0,
      total_quotations:0, draft_quotations:0, sent_quotations:0,
      approved_quotations:0, converted_quotations:0,
      total_invoices:0, pending_invoices:0, partial_invoices:0,
      paid_invoices:0, monthly_revenue:0,
      total_job_cards:0, open_job_cards:0,
    }});
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
    // Return empty array — never send 500 from dashboard (would crash the whole page)
    res.status(200).json({ success: true, data: [] });
  }
});

/* ── GET /api/dashboard/charts ──────────────────────────── */
router.get('/charts', protect, async (req, res, next) => {
  try {
    const safe = async (sql, fallback = []) => {
      try { const r = await db.query(sql); return r.rows; }
      catch { return fallback; }
    };

    const [byCategory, availability, recentMessages,
           quotationsByStatus, recentQuotations, recentInvoices] = await Promise.all([

      safe(`SELECT category, COUNT(*) AS count FROM parts GROUP BY category ORDER BY count DESC`),
      safe(`SELECT is_available, COUNT(*) AS count FROM parts GROUP BY is_available`),
      safe(`SELECT DATE(created_at) AS day, COUNT(*) AS count
            FROM messages WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(created_at) ORDER BY day ASC`),
      safe(`SELECT status, COUNT(*) AS count FROM quotations GROUP BY status ORDER BY count DESC`),
      safe(`SELECT quotation_number, customer_name, total_amount, status, created_at
            FROM quotations ORDER BY created_at DESC LIMIT 5`),
      /* Use created_at in case invoice_date column not yet migrated */
      safe(`SELECT invoice_number, customer_name, total_amount, payment_status, created_at AS invoice_date
            FROM invoices ORDER BY created_at DESC LIMIT 5`),
    ]);

    const avail = { available: 0, unavailable: 0 };
    availability.forEach(r => {
      if (r.is_available) avail.available   = parseInt(r.count);
      else                avail.unavailable = parseInt(r.count);
    });

    res.status(200).json({
      success: true,
      data: {
        partsByCategory:    byCategory.map(r => ({ category: r.category, count: parseInt(r.count) })),
        partsAvailability:  avail,
        recentMessages:     recentMessages.map(r => ({ day: r.day, count: parseInt(r.count) })),
        quotationsByStatus: quotationsByStatus.map(r => ({ status: r.status, count: parseInt(r.count) })),
        recentQuotations,
        recentInvoices,
      },
    });
  } catch (err) {
    res.status(200).json({ success: true, data: {
      partsByCategory: [], partsAvailability: { available: 0, unavailable: 0 },
      recentMessages: [], quotationsByStatus: [], recentQuotations: [], recentInvoices: [],
    }});
  }
});

module.exports = router;
