/**
 * controllers/messagesController.js
 *
 * POST   /api/messages          — public, rate-limited contact form submission
 * GET    /api/messages          — admin, list all messages (newest first)
 * GET    /api/messages/stats    — admin, unread count for dashboard
 * PATCH  /api/messages/:id/read — admin, mark one message as read
 * DELETE /api/messages/:id      — admin, delete message
 */

const db              = require('../config/db');
const { logActivity } = require('../services/activityService');

/* ── POST /api/messages ─────────────────────────────────────
   Public contact form submission. Rate-limited in routes.
   Accepts: name, phone, email (optional), subject, message    */
const submit = async (req, res, next) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    // Server-side validation — mirrors client rules
    const errors = [];
    if (!name    || String(name).trim().length < 2)
      errors.push('Full name is required (minimum 2 characters).');
    if (!phone   || !/^[0-9+\s\-]{7,15}$/.test(String(phone).trim()))
      errors.push('A valid phone number is required.');
    if (!subject || String(subject).trim().length < 2)
      errors.push('Subject is required.');
    if (!message || String(message).trim().length < 10)
      errors.push('Message must be at least 10 characters.');
    if (email && email.trim().length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
        errors.push('Please enter a valid email address.');
    }

    if (errors.length)
      return res.status(400).json({ success: false, message: errors.join(' ') });

    const { rows } = await db.query(
      `INSERT INTO messages (name, phone, email, subject, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        name.trim(),
        phone.trim(),
        email?.trim() || null,
        subject.trim(),
        message.trim(),
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Your message has been sent. We will contact you shortly.',
      id: rows[0].id,
    });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/messages ──────────────────────────────────────
   Admin only. Returns all messages, newest first.
   Supports ?filter=unread for unread-only view.
   Supports ?search= for name/phone/subject search.            */
const getAll = async (req, res, next) => {
  try {
    const { filter, search } = req.query;

    let sql = `
      SELECT id, name, phone, email, subject,
             LEFT(message, 120) AS preview,
             message,
             is_read, created_at
      FROM   messages
      WHERE  1=1
    `;
    const params = [];
    let n = 1;

    if (filter === 'unread') {
      sql += ` AND is_read = FALSE`;
    }
    if (search && search.trim()) {
      sql += ` AND (name ILIKE $${n} OR phone ILIKE $${n} OR subject ILIKE $${n})`;
      params.push(`%${search.trim()}%`);
      n++;
    }

    sql += ` ORDER BY is_read ASC, created_at DESC`;

    const { rows } = await db.query(sql, params);
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/messages/stats ────────────────────────────────
   Admin only. Returns unread count for the dashboard badge.   */
const getStats = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT COUNT(*) FILTER (WHERE is_read = FALSE) AS unread,
              COUNT(*)                                  AS total
       FROM messages`
    );
    res.status(200).json({
      success: true,
      data: {
        unread: parseInt(rows[0].unread),
        total:  parseInt(rows[0].total),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/messages/:id/read ───────────────────────────
   Admin only. Marks a single message as read.                 */
const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `UPDATE messages SET is_read = TRUE WHERE id = $1 RETURNING *`,
      [id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Message not found.' });

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/* ── DELETE /api/messages/:id ───────────────────────────────
   Admin only. Deletes a message and logs the activity.        */
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await db.query(
      'SELECT id, name, subject FROM messages WHERE id = $1', [id]
    );
    if (!existing.rows.length)
      return res.status(404).json({ success: false, message: 'Message not found.' });

    const msg = existing.rows[0];
    await db.query('DELETE FROM messages WHERE id = $1', [id]);

    await logActivity({
      adminId:     req.admin.id,
      action:      'DELETE_MESSAGE',
      entityType:  'message',
      entityId:    id,
      description: `Message from "${msg.name}" deleted by ${req.admin.username}.`,
    });

    res.status(200).json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { submit, getAll, getStats, markRead, remove };
