/**
 * controllers/quotationsController.js
 *
 * GET    /api/quotations              — list all quotations
 * GET    /api/quotations/:id          — single quotation + items
 * POST   /api/quotations              — create
 * PUT    /api/quotations/:id          — update
 * DELETE /api/quotations/:id          — delete
 * POST   /api/quotations/:id/duplicate  — duplicate
 * PATCH  /api/quotations/:id/status   — change status
 * POST   /api/quotations/:id/convert  — convert to invoice
 * GET    /api/quotations/:id/pdf      — stream PDF
 */

const db = require('../config/db');
const { logActivity }          = require('../services/activityService');
const { nextQuotationNumber, nextInvoiceNumber } = require('../services/numberService');
const { generateQuotationPDF } = require('../services/pdfService');

/* ── shared: fetch business info ─────────────────────────── */
const getBiz = async () => {
  const { rows } = await db.query('SELECT * FROM business_info LIMIT 1');
  return rows[0] || {};
};

/* ── helpers ─────────────────────────────────────────────── */
const calcTotals = (items, labourCost = 0, discount = 0, vatRate = 0) => {
  const subtotal  = items.reduce((s, it) => s + (parseFloat(it.unit_price) * parseInt(it.quantity)), 0);
  const vatAmount = vatRate > 0 ? (subtotal + parseFloat(labourCost) - parseFloat(discount)) * (vatRate / 100) : 0;
  const total     = subtotal + parseFloat(labourCost) - parseFloat(discount) + vatAmount;
  return { subtotal, vatAmount, total };
};

/* ── GET /api/quotations ─────────────────────────────────── */
const getAll = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let sql = `
      SELECT q.id, q.quotation_number, q.customer_name, q.phone,
             q.vehicle_make, q.vehicle_model, q.registration_number,
             q.total_amount, q.status, q.created_at, q.updated_at,
             q.expiry_date, q.prepared_by,
             COUNT(qi.id)::int AS item_count
      FROM   quotations q
      LEFT JOIN quotation_items qi ON qi.quotation_id = q.id
      WHERE  1=1
    `;
    const params = [];
    let n = 1;

    if (status && status !== 'all') { sql += ` AND q.status = $${n++}`; params.push(status); }
    if (search?.trim()) {
      sql += ` AND (q.customer_name ILIKE $${n} OR q.quotation_number ILIKE $${n} OR q.phone ILIKE $${n})`;
      params.push(`%${search.trim()}%`); n++;
    }
    sql += ` GROUP BY q.id ORDER BY q.created_at DESC`;

    const { rows } = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

/* ── GET /api/quotations/:id ─────────────────────────────── */
const getOne = async (req, res, next) => {
  try {
    const { rows: [q] } = await db.query('SELECT * FROM quotations WHERE id = $1', [req.params.id]);
    if (!q) return res.status(404).json({ success: false, message: 'Quotation not found.' });

    const { rows: items } = await db.query(
      'SELECT * FROM quotation_items WHERE quotation_id = $1 ORDER BY sort_order, id',
      [req.params.id]
    );
    res.json({ success: true, data: { ...q, items } });
  } catch (err) { next(err); }
};

/* ── POST /api/quotations ────────────────────────────────── */
const create = async (req, res, next) => {
  try {
    const {
      customer_name, phone, customer_address,
      vehicle_make, vehicle_model, vehicle_colour, vehicle_vin,
      registration_number, mileage,
      expiry_date, prepared_by, notes, status = 'draft',
      labour_cost = 0, discount = 0, vat_rate = 0,
      items = [],
    } = req.body;

    if (!customer_name?.trim()) return res.status(400).json({ success: false, message: 'Customer name is required.' });
    if (!phone?.trim())          return res.status(400).json({ success: false, message: 'Phone number is required.' });
    if (!items.length)           return res.status(400).json({ success: false, message: 'At least one line item is required.' });

    const quotation_number = await nextQuotationNumber();
    const { subtotal, vatAmount, total } = calcTotals(items, labour_cost, discount, vat_rate);

    const { rows: [q] } = await db.query(
      `INSERT INTO quotations
         (quotation_number, customer_name, phone, customer_address,
          vehicle_make, vehicle_model, vehicle_colour, vehicle_vin,
          registration_number, mileage, expiry_date, prepared_by,
          notes, status, labour_cost, discount, vat_amount, total_amount)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING *`,
      [quotation_number, customer_name.trim(), phone.trim(),
       customer_address?.trim() || null,
       vehicle_make?.trim() || null, vehicle_model?.trim() || null,
       vehicle_colour?.trim() || null, vehicle_vin?.trim() || null,
       registration_number?.trim() || null, mileage?.trim() || null,
       expiry_date || null, prepared_by?.trim() || null,
       notes?.trim() || null, status,
       parseFloat(labour_cost) || 0, parseFloat(discount) || 0,
       vatAmount, total]
    );

    /* Insert items */
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const lineTotal = parseFloat(it.unit_price) * parseInt(it.quantity);
      await db.query(
        `INSERT INTO quotation_items (quotation_id, description, quantity, unit_price, total, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [q.id, it.description.trim(), parseInt(it.quantity), parseFloat(it.unit_price), lineTotal, i]
      );
    }

    await logActivity({ adminId: req.admin.id, action: 'CREATE_QUOTATION', entityType: 'quotation',
      entityId: q.id, description: `Quotation ${quotation_number} created for ${customer_name} by ${req.admin.username}.` });

    res.status(201).json({ success: true, message: 'Quotation created.', data: q });
  } catch (err) { next(err); }
};

/* ── PUT /api/quotations/:id ─────────────────────────────── */
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db.query('SELECT * FROM quotations WHERE id = $1', [id]);
    if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Quotation not found.' });

    const {
      customer_name, phone, customer_address,
      vehicle_make, vehicle_model, vehicle_colour, vehicle_vin,
      registration_number, mileage, expiry_date, prepared_by,
      notes, status, labour_cost = 0, discount = 0, vat_rate = 0,
      items = [],
    } = req.body;

    if (!customer_name?.trim()) return res.status(400).json({ success: false, message: 'Customer name is required.' });
    if (!items.length)           return res.status(400).json({ success: false, message: 'At least one line item is required.' });

    const { subtotal, vatAmount, total } = calcTotals(items, labour_cost, discount, vat_rate);

    const { rows: [q] } = await db.query(
      `UPDATE quotations SET
         customer_name=$1, phone=$2, customer_address=$3,
         vehicle_make=$4, vehicle_model=$5, vehicle_colour=$6, vehicle_vin=$7,
         registration_number=$8, mileage=$9, expiry_date=$10, prepared_by=$11,
         notes=$12, status=$13, labour_cost=$14, discount=$15, vat_amount=$16,
         total_amount=$17, updated_at=NOW()
       WHERE id=$18 RETURNING *`,
      [customer_name.trim(), phone?.trim(), customer_address?.trim() || null,
       vehicle_make?.trim() || null, vehicle_model?.trim() || null,
       vehicle_colour?.trim() || null, vehicle_vin?.trim() || null,
       registration_number?.trim() || null, mileage?.trim() || null,
       expiry_date || null, prepared_by?.trim() || null,
       notes?.trim() || null, status || 'draft',
       parseFloat(labour_cost) || 0, parseFloat(discount) || 0,
       vatAmount, total, id]
    );

    /* Replace items */
    await db.query('DELETE FROM quotation_items WHERE quotation_id = $1', [id]);
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const lineTotal = parseFloat(it.unit_price) * parseInt(it.quantity);
      await db.query(
        `INSERT INTO quotation_items (quotation_id, description, quantity, unit_price, total, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [id, it.description.trim(), parseInt(it.quantity), parseFloat(it.unit_price), lineTotal, i]
      );
    }

    await logActivity({ adminId: req.admin.id, action: 'UPDATE_QUOTATION', entityType: 'quotation',
      entityId: id, description: `Quotation ${q.quotation_number} updated by ${req.admin.username}.` });

    res.json({ success: true, message: 'Quotation updated.', data: q });
  } catch (err) { next(err); }
};

/* ── DELETE /api/quotations/:id ──────────────────────────── */
const remove = async (req, res, next) => {
  try {
    const { rows: [q] } = await db.query('SELECT * FROM quotations WHERE id = $1', [req.params.id]);
    if (!q) return res.status(404).json({ success: false, message: 'Quotation not found.' });

    await db.query('DELETE FROM quotations WHERE id = $1', [req.params.id]);

    await logActivity({ adminId: req.admin.id, action: 'DELETE_QUOTATION', entityType: 'quotation',
      entityId: req.params.id, description: `Quotation ${q.quotation_number} deleted by ${req.admin.username}.` });

    res.json({ success: true, message: 'Quotation deleted.' });
  } catch (err) { next(err); }
};

/* ── POST /api/quotations/:id/duplicate ──────────────────── */
const duplicate = async (req, res, next) => {
  try {
    const { rows: [orig] } = await db.query('SELECT * FROM quotations WHERE id = $1', [req.params.id]);
    if (!orig) return res.status(404).json({ success: false, message: 'Quotation not found.' });

    const { rows: items } = await db.query(
      'SELECT * FROM quotation_items WHERE quotation_id = $1 ORDER BY sort_order', [req.params.id]
    );

    const newNumber = await nextQuotationNumber();
    const { rows: [q] } = await db.query(
      `INSERT INTO quotations
         (quotation_number, customer_name, phone, customer_address,
          vehicle_make, vehicle_model, vehicle_colour, vehicle_vin,
          registration_number, mileage, expiry_date, prepared_by,
          notes, status, labour_cost, discount, vat_amount, total_amount)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'draft',$14,$15,$16,$17)
       RETURNING *`,
      [newNumber, orig.customer_name, orig.phone, orig.customer_address,
       orig.vehicle_make, orig.vehicle_model, orig.vehicle_colour, orig.vehicle_vin,
       orig.registration_number, orig.mileage, orig.expiry_date, orig.prepared_by,
       orig.notes, orig.labour_cost, orig.discount, orig.vat_amount, orig.total_amount]
    );

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      await db.query(
        `INSERT INTO quotation_items (quotation_id, description, quantity, unit_price, total, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [q.id, it.description, it.quantity, it.unit_price, it.total, i]
      );
    }

    await logActivity({ adminId: req.admin.id, action: 'CREATE_QUOTATION', entityType: 'quotation',
      entityId: q.id, description: `Quotation ${orig.quotation_number} duplicated as ${newNumber} by ${req.admin.username}.` });

    res.status(201).json({ success: true, message: 'Quotation duplicated.', data: q });
  } catch (err) { next(err); }
};

/* ── PATCH /api/quotations/:id/status ────────────────────── */
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['draft','sent','approved','rejected','converted'];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });

    const { rows: [q] } = await db.query(
      'UPDATE quotations SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (!q) return res.status(404).json({ success: false, message: 'Quotation not found.' });

    await logActivity({ adminId: req.admin.id, action: 'UPDATE_QUOTATION', entityType: 'quotation',
      entityId: req.params.id, description: `Quotation ${q.quotation_number} status changed to ${status} by ${req.admin.username}.` });

    res.json({ success: true, data: q });
  } catch (err) { next(err); }
};

/* ── POST /api/quotations/:id/convert ───────────────────────
   Copy quotation → new invoice, mark quotation as 'converted'  */
const convert = async (req, res, next) => {
  try {
    const { rows: [q] } = await db.query('SELECT * FROM quotations WHERE id = $1', [req.params.id]);
    if (!q) return res.status(404).json({ success: false, message: 'Quotation not found.' });

    const { rows: items } = await db.query(
      'SELECT * FROM quotation_items WHERE quotation_id = $1 ORDER BY sort_order', [q.id]
    );

    const invoice_number = await nextInvoiceNumber();
    const today          = new Date().toISOString().split('T')[0];

    const { rows: [inv] } = await db.query(
      `INSERT INTO invoices
         (invoice_number, quotation_id, customer_name, phone, customer_address,
          vehicle_make, vehicle_model, vehicle, registration_number,
          vehicle_colour, vehicle_vin, mileage, prepared_by,
          labour_cost, discount, vat_amount, total_amount, notes,
          payment_status, invoice_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'pending',$19)
       RETURNING *`,
      [invoice_number, q.id, q.customer_name, q.phone, q.customer_address,
       q.vehicle_make, q.vehicle_model,
       [q.vehicle_make, q.vehicle_model].filter(Boolean).join(' ') || null,
       q.registration_number, q.vehicle_colour, q.vehicle_vin, q.mileage,
       q.prepared_by, q.labour_cost, q.discount, q.vat_amount, q.total_amount,
       q.notes, today]
    );

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      await db.query(
        `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [inv.id, it.description, it.quantity, it.unit_price, it.total, i]
      );
    }

    /* Mark quotation as converted */
    await db.query('UPDATE quotations SET status=$1, updated_at=NOW() WHERE id=$2', ['converted', q.id]);

    await logActivity({ adminId: req.admin.id, action: 'CREATE_INVOICE', entityType: 'invoice',
      entityId: inv.id, description: `Quotation ${q.quotation_number} converted to Invoice ${invoice_number} by ${req.admin.username}.` });

    res.status(201).json({ success: true, message: `Invoice ${invoice_number} created.`, data: inv });
  } catch (err) { next(err); }
};

/* ── GET /api/quotations/:id/pdf ─────────────────────────── */
const pdf = async (req, res, next) => {
  try {
    const { rows: [q] } = await db.query('SELECT * FROM quotations WHERE id = $1', [req.params.id]);
    if (!q) return res.status(404).json({ success: false, message: 'Quotation not found.' });

    const { rows: items } = await db.query(
      'SELECT * FROM quotation_items WHERE quotation_id = $1 ORDER BY sort_order', [q.id]
    );
    const biz = await getBiz();

    await generateQuotationPDF(q, items, biz, res);

    await logActivity({ adminId: req.admin.id, action: 'PRINT_QUOTATION', entityType: 'quotation',
      entityId: q.id, description: `Quotation ${q.quotation_number} PDF generated by ${req.admin.username}.` });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove, duplicate, updateStatus, convert, pdf };
