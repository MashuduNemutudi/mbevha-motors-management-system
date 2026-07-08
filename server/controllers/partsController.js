/**
 * controllers/partsController.js
 *
 * GET    /api/parts          — public, lists available parts (or all for admin)
 * GET    /api/parts/:id      — public, single part
 * POST   /api/parts          — admin, create with optional image
 * PUT    /api/parts/:id      — admin, update with optional new image
 * PATCH  /api/parts/:id/availability — admin, toggle is_available
 * DELETE /api/parts/:id      — admin, delete part + file
 */

const path = require('path');
const fs   = require('fs');
const db   = require('../config/db');
const { logActivity } = require('../services/activityService');

/* ── Helper: build public image URL from stored filename ───── */
const imageUrl = (filename) =>
  filename ? `/uploads/parts/${filename}` : null;

/* ── GET /api/parts ─────────────────────────────────────────
   Public: returns only available parts (is_available = true)
   Admin (JWT present via ?admin=1 query or checked via header):
   we keep it simple — always return all parts so the admin
   dashboard can see unavailable ones too. Clients filter.       */
const getAll = async (req, res, next) => {
  try {
    const { category, search, available } = req.query;

    let sql = `
      SELECT id, name, category, description, price, quantity,
             is_available, image_url, created_at, updated_at
      FROM   parts
      WHERE  1=1
    `;
    const params = [];
    let n = 1;

    if (available === 'true') {
      sql += ` AND is_available = TRUE`;
    }
    if (category && category !== 'All') {
      sql += ` AND category = $${n++}`;
      params.push(category);
    }
    if (search) {
      sql += ` AND (name ILIKE $${n} OR description ILIKE $${n})`;
      params.push(`%${search}%`);
      n++;
    }

    sql += ` ORDER BY created_at DESC`;

    const { rows } = await db.query(sql, params);
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/parts/:id ─────────────────────────────────────*/
const getOne = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM parts WHERE id = $1`,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Part not found.' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/parts ────────────────────────────────────────*/
const create = async (req, res, next) => {
  try {
    const { name, category, description, price, quantity, is_available } = req.body;

    // Validation
    const errors = [];
    if (!name || String(name).trim().length < 2)
      errors.push('Part name is required (minimum 2 characters).');
    if (!category || String(category).trim().length < 2)
      errors.push('Category is required.');
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0)
      errors.push('Price is required and must be zero or greater.');
    if (errors.length)
      return res.status(400).json({ success: false, message: errors.join(' ') });

    const filename = req.file ? req.file.filename : null;

    const { rows } = await db.query(
      `INSERT INTO parts (name, category, description, price, quantity, is_available, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name.trim(),
        category.trim(),
        description?.trim() || null,
        Number(price),
        parseInt(quantity) || 0,
        is_available === 'false' || is_available === false ? false : true,
        filename,
      ]
    );

    await logActivity({
      adminId:     req.admin.id,
      action:      'ADD_PART',
      entityType:  'part',
      entityId:    rows[0].id,
      description: `Part "${rows[0].name}" added by ${req.admin.username}.`,
    });

    res.status(201).json({ success: true, message: 'Part added successfully.', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/* ── PUT /api/parts/:id ─────────────────────────────────────*/
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, description, price, quantity, is_available } = req.body;

    // Check exists
    const existing = await db.query('SELECT * FROM parts WHERE id = $1', [id]);
    if (!existing.rows.length)
      return res.status(404).json({ success: false, message: 'Part not found.' });

    const old = existing.rows[0];

    // Validation
    const errors = [];
    if (name !== undefined && String(name).trim().length < 2)
      errors.push('Part name must be at least 2 characters.');
    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0))
      errors.push('Price must be zero or greater.');
    if (errors.length)
      return res.status(400).json({ success: false, message: errors.join(' ') });

    // If a new image uploaded, delete the old file
    let filename = old.image_url;
    if (req.file) {
      if (old.image_url) {
        const oldPath = path.join(__dirname, '..', 'uploads', 'parts', old.image_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      filename = req.file.filename;
    }

    const { rows } = await db.query(
      `UPDATE parts
       SET name         = COALESCE($1, name),
           category     = COALESCE($2, category),
           description  = COALESCE($3, description),
           price        = COALESCE($4, price),
           quantity     = COALESCE($5, quantity),
           is_available = COALESCE($6, is_available),
           image_url    = $7,
           updated_at   = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        name?.trim()     || null,
        category?.trim() || null,
        description !== undefined ? (description?.trim() || null) : undefined,
        price !== undefined ? Number(price) : null,
        quantity !== undefined ? (parseInt(quantity) || 0) : null,
        is_available !== undefined
          ? (is_available === 'false' || is_available === false ? false : true)
          : null,
        filename,
        id,
      ]
    );

    await logActivity({
      adminId:     req.admin.id,
      action:      'UPDATE_PART',
      entityType:  'part',
      entityId:    id,
      description: `Part "${rows[0].name}" updated by ${req.admin.username}.`,
    });

    res.status(200).json({ success: true, message: 'Part updated successfully.', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/parts/:id/availability ─────────────────────*/
const toggleAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `UPDATE parts SET is_available = NOT is_available, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Part not found.' });

    await logActivity({
      adminId:     req.admin.id,
      action:      'UPDATE_PART',
      entityType:  'part',
      entityId:    id,
      description: `Part "${rows[0].name}" marked ${rows[0].is_available ? 'available' : 'unavailable'} by ${req.admin.username}.`,
    });

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/* ── DELETE /api/parts/:id ──────────────────────────────────*/
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db.query('SELECT * FROM parts WHERE id = $1', [id]);
    if (!existing.rows.length)
      return res.status(404).json({ success: false, message: 'Part not found.' });

    const part = existing.rows[0];

    // Delete the image file if it exists
    if (part.image_url) {
      const filePath = path.join(__dirname, '..', 'uploads', 'parts', part.image_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.query('DELETE FROM parts WHERE id = $1', [id]);

    await logActivity({
      adminId:     req.admin.id,
      action:      'DELETE_PART',
      entityType:  'part',
      entityId:    id,
      description: `Part "${part.name}" deleted by ${req.admin.username}.`,
    });

    res.status(200).json({ success: true, message: 'Part deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, toggleAvailability, remove };
