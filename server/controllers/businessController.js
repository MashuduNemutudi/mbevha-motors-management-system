/**
 * controllers/businessController.js
 * GET  /api/business  — public, returns the single business_info row
 * PUT  /api/business  — admin only, updates the row
 */

const db              = require('../config/db');
const { logActivity } = require('../services/activityService');

/* ── GET /api/business ─────────────────────────────────── */
const getBusinessInfo = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, business_name, motto, phone, email, address,
              about, opening_hours, whatsapp_number, google_maps_link, updated_at
       FROM business_info
       LIMIT 1`
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business information has not been configured yet.',
      });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

/* ── PUT /api/business ─────────────────────────────────── */
const updateBusinessInfo = async (req, res, next) => {
  try {
    const {
      business_name, motto, phone, email,
      address, about, opening_hours,
      whatsapp_number, google_maps_link,
    } = req.body;

    // Validation
    const errors = [];
    if (!business_name || String(business_name).trim().length < 2)
      errors.push('Business name is required (minimum 2 characters).');
    if (!phone || String(phone).trim().length < 7)
      errors.push('Phone number is required (minimum 7 characters).');
    if (!address || String(address).trim().length < 5)
      errors.push('Address is required (minimum 5 characters).');
    if (email && email.trim().length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
        errors.push('Please enter a valid email address.');
    }
    if (errors.length > 0)
      return res.status(400).json({ success: false, message: errors.join(' ') });

    // Check if row exists
    const existing = await db.query('SELECT id FROM business_info LIMIT 1');
    let updatedRow;

    if (existing.rows.length === 0) {
      // No row yet — INSERT
      const { rows } = await db.query(
        `INSERT INTO business_info
           (business_name, motto, phone, email, address, about,
            opening_hours, whatsapp_number, google_maps_link)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *`,
        [
          business_name.trim(),
          motto?.trim()            || null,
          phone.trim(),
          email?.trim()            || null,
          address.trim(),
          about?.trim()            || null,
          opening_hours?.trim()    || null,
          whatsapp_number?.trim()  || null,
          google_maps_link?.trim() || null,
        ]
      );
      updatedRow = rows[0];
    } else {
      // UPDATE existing row
      const { rows } = await db.query(
        `UPDATE business_info
         SET business_name    = $1,
             motto            = $2,
             phone            = $3,
             email            = $4,
             address          = $5,
             about            = $6,
             opening_hours    = $7,
             whatsapp_number  = $8,
             google_maps_link = $9,
             updated_at       = NOW()
         WHERE id = $10
         RETURNING *`,
        [
          business_name.trim(),
          motto?.trim()            || null,
          phone.trim(),
          email?.trim()            || null,
          address.trim(),
          about?.trim()            || null,
          opening_hours?.trim()    || null,
          whatsapp_number?.trim()  || null,
          google_maps_link?.trim() || null,
          existing.rows[0].id,
        ]
      );
      updatedRow = rows[0];
    }

    // Activity log
    await logActivity({
      adminId:     req.admin.id,
      action:      'UPDATE_BUSINESS',
      entityType:  'business_info',
      entityId:    updatedRow.id,
      description: `Business information updated by ${req.admin.username}.`,
    });

    res.status(200).json({
      success: true,
      message: 'Business information updated successfully.',
      data: updatedRow,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBusinessInfo, updateBusinessInfo };
