/**
 * controllers/jobCardsController.js
 *
 * GET    /api/job-cards           — list all (newest first)
 * GET    /api/job-cards/:id       — get single job card
 * POST   /api/job-cards           — create
 * PUT    /api/job-cards/:id       — update
 * DELETE /api/job-cards/:id       — delete
 * GET    /api/job-cards/:id/pdf   — stream PDF
 */

const db                  = require('../config/db');
const { logActivity }     = require('../services/activityService');
const { nextJobCardNumber } = require('../services/numberService');
const { generateJobCardPDF } = require('../services/pdfService');

/* ── GET /api/job-cards ─────────────────────────────────── */
const getAll = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let sql = `SELECT id, job_card_number, job_date, owner_name, contact_number,
                      vehicle_make, registration_number, technician_name,
                      status, created_at
               FROM job_cards WHERE 1=1`;
    const params = [];
    let p = 1;

    if (status && status !== 'all') {
      sql += ` AND status = $${p++}`;
      params.push(status);
    }
    if (search?.trim()) {
      sql += ` AND (owner_name ILIKE $${p} OR job_card_number ILIKE $${p}
                    OR registration_number ILIKE $${p} OR vehicle_make ILIKE $${p})`;
      params.push(`%${search.trim()}%`);
    }
    sql += ' ORDER BY created_at DESC';

    const { rows } = await db.query(sql, params);
    res.status(200).json({ success: true, data: rows });
  } catch (err) { next(err); }
};

/* ── GET /api/job-cards/:id ─────────────────────────────── */
const getOne = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM job_cards WHERE id = $1', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Job card not found.' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

/* ── POST /api/job-cards ────────────────────────────────── */
const create = async (req, res, next) => {
  try {
    const {
      job_date, vehicle_make, registration_number, vehicle_colour,
      vehicle_vin, mileage, owner_name, id_number, contact_number,
      residential_address, job_description, items_checklist,
      battery_type, battery_colour, battery_size, technician_name,
      received_by, status = 'open', notes,
    } = req.body;

    if (!owner_name?.trim())
      return res.status(400).json({ success: false, message: 'Owner name is required.' });
    if (!contact_number?.trim())
      return res.status(400).json({ success: false, message: 'Contact number is required.' });

    const job_card_number = await nextJobCardNumber();

    const { rows } = await db.query(
      `INSERT INTO job_cards
         (job_card_number, job_date, vehicle_make, registration_number, vehicle_colour,
          vehicle_vin, mileage, owner_name, id_number, contact_number, residential_address,
          job_description, items_checklist, battery_type, battery_colour, battery_size,
          technician_name, received_by, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
       RETURNING *`,
      [
        job_card_number,
        job_date || new Date().toISOString().split('T')[0],
        vehicle_make?.trim()          || null,
        registration_number?.trim()   || null,
        vehicle_colour?.trim()        || null,
        vehicle_vin?.trim()           || null,
        mileage?.trim()               || null,
        owner_name.trim(),
        id_number?.trim()             || null,
        contact_number.trim(),
        residential_address?.trim()   || null,
        job_description?.trim()       || null,
        JSON.stringify(items_checklist || []),
        battery_type?.trim()          || null,
        battery_colour?.trim()        || null,
        battery_size?.trim()          || null,
        technician_name?.trim()       || null,
        received_by?.trim()           || null,
        status,
        notes?.trim()                 || null,
      ]
    );

    await logActivity({
      adminId: req.admin.id, action: 'CREATE_JOB_CARD',
      entityType: 'job_card', entityId: rows[0].id,
      description: `Job card ${job_card_number} created for ${owner_name.trim()}.`,
    });

    res.status(201).json({ success: true, message: 'Job card created.', data: rows[0] });
  } catch (err) { next(err); }
};

/* ── PUT /api/job-cards/:id ─────────────────────────────── */
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db.query('SELECT id, job_card_number FROM job_cards WHERE id = $1', [id]);
    if (!existing.rows.length)
      return res.status(404).json({ success: false, message: 'Job card not found.' });

    const {
      job_date, vehicle_make, registration_number, vehicle_colour,
      vehicle_vin, mileage, owner_name, id_number, contact_number,
      residential_address, job_description, items_checklist,
      battery_type, battery_colour, battery_size, technician_name, received_by,
      status, notes,
    } = req.body;

    if (!owner_name?.trim())
      return res.status(400).json({ success: false, message: 'Owner name is required.' });

    const { rows } = await db.query(
      `UPDATE job_cards SET
         job_date=$1, vehicle_make=$2, registration_number=$3, vehicle_colour=$4,
         vehicle_vin=$5, mileage=$6, owner_name=$7, id_number=$8, contact_number=$9,
         residential_address=$10, job_description=$11, items_checklist=$12,
         battery_type=$13, battery_colour=$14, battery_size=$15,
         technician_name=$16, received_by=$17, status=$18, notes=$19, updated_at=NOW()
       WHERE id = $20 RETURNING *`,
      [
        job_date, vehicle_make?.trim()||null, registration_number?.trim()||null,
        vehicle_colour?.trim()||null, vehicle_vin?.trim()||null, mileage?.trim()||null,
        owner_name.trim(), id_number?.trim()||null, contact_number?.trim(),
        residential_address?.trim()||null, job_description?.trim()||null,
        JSON.stringify(items_checklist || []),
        battery_type?.trim()||null, battery_colour?.trim()||null, battery_size?.trim()||null,
        technician_name?.trim()||null, received_by?.trim()||null, status||'open', notes?.trim()||null, id,
      ]
    );

    await logActivity({
      adminId: req.admin.id, action: 'UPDATE_JOB_CARD',
      entityType: 'job_card', entityId: id,
      description: `Job card ${existing.rows[0].job_card_number} updated.`,
    });

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

/* ── DELETE /api/job-cards/:id ──────────────────────────── */
const remove = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'DELETE FROM job_cards WHERE id = $1 RETURNING job_card_number, owner_name', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Job card not found.' });

    await logActivity({
      adminId: req.admin.id, action: 'DELETE_JOB_CARD',
      entityType: 'job_card', entityId: req.params.id,
      description: `Job card ${rows[0].job_card_number} for ${rows[0].owner_name} deleted.`,
    });

    res.status(200).json({ success: true, message: 'Job card deleted.' });
  } catch (err) { next(err); }
};

/* ── GET /api/job-cards/:id/pdf ─────────────────────────── */
const pdf = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM job_cards WHERE id = $1', [req.params.id]);
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Job card not found.' });

    const bizRows = await db.query('SELECT * FROM business_info LIMIT 1');
    const biz = bizRows.rows[0] || {};

    await logActivity({
      adminId: req.admin.id, action: 'PRINT_JOB_CARD',
      entityType: 'job_card', entityId: req.params.id,
      description: `Job card ${rows[0].job_card_number} PDF generated.`,
    });

    await generateJobCardPDF(rows[0], biz, res);
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove, pdf };
