/**
 * controllers/galleryController.js
 *
 * GET    /api/gallery       — public, all images
 * POST   /api/gallery       — admin, upload image
 * PATCH  /api/gallery/:id   — admin, update title/description/caption
 * DELETE /api/gallery/:id   — admin, delete image + file
 */

const path = require('path');
const fs   = require('fs');
const db   = require('../config/db');
const { logActivity } = require('../services/activityService');

/* ── GET /api/gallery ───────────────────────────────────────*/
const getAll = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, image_url, caption, created_at, updated_at
       FROM gallery
       ORDER BY created_at DESC`
    );
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/gallery ──────────────────────────────────────*/
const upload = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'An image file is required.' });

    const caption = req.body.caption?.trim() || null;

    const { rows } = await db.query(
      `INSERT INTO gallery (image_url, caption)
       VALUES ($1, $2)
       RETURNING *`,
      [req.file.filename, caption]
    );

    await logActivity({
      adminId:     req.admin.id,
      action:      'UPLOAD_IMAGE',
      entityType:  'gallery',
      entityId:    rows[0].id,
      description: `Gallery image "${req.file.originalname}" uploaded by ${req.admin.username}.`,
    });

    res.status(201).json({ success: true, message: 'Image uploaded successfully.', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/* ── PATCH /api/gallery/:id ─────────────────────────────────*/
const updateCaption = async (req, res, next) => {
  try {
    const { id } = req.params;
    const caption = req.body.caption?.trim() ?? null;

    const { rows } = await db.query(
      `UPDATE gallery SET caption = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [caption, id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Image not found.' });

    await logActivity({
      adminId:     req.admin.id,
      action:      'UPDATE_CAPTION',
      entityType:  'gallery',
      entityId:    id,
      description: `Gallery image caption updated by ${req.admin.username}.`,
    });

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/* ── DELETE /api/gallery/:id ────────────────────────────────*/
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db.query('SELECT * FROM gallery WHERE id = $1', [id]);
    if (!existing.rows.length)
      return res.status(404).json({ success: false, message: 'Image not found.' });

    const img = existing.rows[0];

    // Delete the physical file
    if (img.image_url) {
      const filePath = path.join(__dirname, '..', 'uploads', 'gallery', img.image_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.query('DELETE FROM gallery WHERE id = $1', [id]);

    await logActivity({
      adminId:     req.admin.id,
      action:      'DELETE_IMAGE',
      entityType:  'gallery',
      entityId:    id,
      description: `Gallery image deleted by ${req.admin.username}.`,
    });

    res.status(200).json({ success: true, message: 'Image deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, upload, updateCaption, remove };
