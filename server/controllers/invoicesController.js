/**
 * controllers/invoicesController.js
 *
 * GET    /api/invoices              — list all
 * GET    /api/invoices/:id          — single invoice + items
 * POST   /api/invoices              — create standalone invoice
 * PUT    /api/invoices/:id          — update
 * DELETE /api/invoices/:id          — delete
 * PATCH  /api/invoices/:id/payment  — update payment status/method
 * GET    /api/invoices/:id/pdf      — stream PDF
 */

const db = require('../config/db');
const { logActivity }        = require('../services/activityService');
const { nextInvoiceNumber }  = require('../services/numberService');
const { generateInvoicePDF } = require('../services/pdfService');

const getBiz = async () => {
  const { rows } = await db.query('SELECT * FROM business_info LIMIT 1');
  return rows[0] || {};
};

const calcTotals = (items, labourCost = 0, discount = 0, vatRate = 0) => {
  const subtotal  = items.reduce((s, it) => s + (parseFloat(it.unit_price) * parseInt(it.quantity)), 0);
  const vatAmount = vatRate > 0 ? (subtotal + parseFloat(labourCost) - parseFloat(discount)) * (vatRate / 100) : 0;
  const total     = subtotal + parseFloat(labourCost) - parseFloat(discount) + vatAmount;
  return { subtotal, vatAmount, total };
};

/* ── GET /api/invoices ───────────────────────────────────── */
const getAll = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let sql = `
      SELECT i.id, i.invoice_number, i.quotation_id,
             i.customer_name, i.phone, i.vehicle, i.vehicle_make, i.vehicle_model,
             i.registration_number, i.total_amount,
             i.payment_status, i.payment_method, i.reference_number,
             i.invoice_date, i.created_at, i.updated_at,
             COUNT(ii.id)::int AS item_count
      FROM   invoices i
      LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
      WHERE  1=1
    `;
    const params = [];
    let n = 1;

    if (status && status !== 'all') { sql += ` AND i.payment_status = $${n++}`; params.push(status); }
    if (search?.trim()) {
      sql += ` AND (i.customer_name ILIKE $${n} OR i.invoice_number ILIKE $${n} OR i.phone ILIKE $${n})`;
      params.push(`%${search.trim()}%`); n++;
    }
    sql += ` GROUP BY i.id ORDER BY i.created_at DESC`;

    const { rows } = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

/* ── GET /api/invoices/:id ───────────────────────────────── */
const getOne = async (req, res, next) => {
  try {
    const { rows: [inv] } = await db.query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found.' });

    const { rows: items } = await db.query(
      'SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY sort_order, id',
      [req.params.id]
    );
    res.json({ success: true, data: { ...inv, items } });
  } catch (err) { next(err); }
};

/* ── POST /api/invoices ──────────────────────────────────── */
const create = async (req, res, next) => {
  try {
    const {
      customer_name, phone, customer_address,
      vehicle_make, vehicle_model, vehicle_colour, vehicle_vin,
      registration_number, mileage, prepared_by, notes,
      labour_cost = 0, discount = 0, vat_rate = 0,
      payment_status = 'pending', payment_method, reference_number,
      invoice_date, items = [],
    } = req.body;

    if (!customer_name?.trim()) return res.status(400).json({ success: false, message: 'Customer name is required.' });
    if (!items.length)           return res.status(400).json({ success: false, message: 'At least one line item is required.' });

    const invoice_number = await nextInvoiceNumber();
    const { vatAmount, total } = calcTotals(items, labour_cost, discount, vat_rate);
    const vehicleStr = [vehicle_make, vehicle_model].filter(Boolean).join(' ') || null;
    const today      = invoice_date || new Date().toISOString().split('T')[0];

    const { rows: [inv] } = await db.query(
      `INSERT INTO invoices
         (invoice_number, customer_name, phone, customer_address,
          vehicle_make, vehicle_model, vehicle, registration_number,
          vehicle_colour, vehicle_vin, mileage, prepared_by, notes,
          labour_cost, discount, vat_amount, total_amount,
          payment_status, payment_method, reference_number, invoice_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
       RETURNING *`,
      [invoice_number, customer_name.trim(), phone?.trim(), customer_address?.trim() || null,
       vehicle_make?.trim() || null, vehicle_model?.trim() || null, vehicleStr,
       registration_number?.trim() || null, vehicle_colour?.trim() || null,
       vehicle_vin?.trim() || null, mileage?.trim() || null, prepared_by?.trim() || null,
       notes?.trim() || null, parseFloat(labour_cost) || 0, parseFloat(discount) || 0,
       vatAmount, total, payment_status,
       payment_method || null, reference_number?.trim() || null, today]
    );

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const lineTotal = parseFloat(it.unit_price) * parseInt(it.quantity);
      await db.query(
        `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [inv.id, it.description.trim(), parseInt(it.quantity), parseFloat(it.unit_price), lineTotal, i]
      );
    }

    await logActivity({ adminId: req.admin.id, action: 'CREATE_INVOICE', entityType: 'invoice',
      entityId: inv.id, description: `Invoice ${invoice_number} created for ${customer_name} by ${req.admin.username}.` });

    res.status(201).json({ success: true, message: 'Invoice created.', data: inv });
  } catch (err) { next(err); }
};

/* ── PUT /api/invoices/:id ───────────────────────────────── */
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db.query('SELECT * FROM invoices WHERE id = $1', [id]);
    if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Invoice not found.' });

    const {
      customer_name, phone, customer_address,
      vehicle_make, vehicle_model, vehicle_colour, vehicle_vin,
      registration_number, mileage, prepared_by, notes,
      labour_cost = 0, discount = 0, vat_rate = 0,
      payment_status, payment_method, reference_number,
      invoice_date, items = [],
    } = req.body;

    if (!customer_name?.trim()) return res.status(400).json({ success: false, message: 'Customer name is required.' });

    const { vatAmount, total } = calcTotals(items, labour_cost, discount, vat_rate);
    const vehicleStr = [vehicle_make, vehicle_model].filter(Boolean).join(' ') || null;

    const { rows: [inv] } = await db.query(
      `UPDATE invoices SET
         customer_name=$1, phone=$2, customer_address=$3,
         vehicle_make=$4, vehicle_model=$5, vehicle=$6,
         registration_number=$7, vehicle_colour=$8, vehicle_vin=$9, mileage=$10,
         prepared_by=$11, notes=$12, labour_cost=$13, discount=$14, vat_amount=$15,
         total_amount=$16, payment_status=$17, payment_method=$18,
         reference_number=$19, invoice_date=$20, updated_at=NOW()
       WHERE id=$21 RETURNING *`,
      [customer_name.trim(), phone?.trim(), customer_address?.trim() || null,
       vehicle_make?.trim() || null, vehicle_model?.trim() || null, vehicleStr,
       registration_number?.trim() || null, vehicle_colour?.trim() || null,
       vehicle_vin?.trim() || null, mileage?.trim() || null,
       prepared_by?.trim() || null, notes?.trim() || null,
       parseFloat(labour_cost) || 0, parseFloat(discount) || 0,
       vatAmount, total, payment_status || 'pending',
       payment_method || null, reference_number?.trim() || null,
       invoice_date || null, id]
    );

    await db.query('DELETE FROM invoice_items WHERE invoice_id = $1', [id]);
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const lineTotal = parseFloat(it.unit_price) * parseInt(it.quantity);
      await db.query(
        `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [id, it.description.trim(), parseInt(it.quantity), parseFloat(it.unit_price), lineTotal, i]
      );
    }

    await logActivity({ adminId: req.admin.id, action: 'UPDATE_INVOICE', entityType: 'invoice',
      entityId: id, description: `Invoice ${inv.invoice_number} updated by ${req.admin.username}.` });

    res.json({ success: true, message: 'Invoice updated.', data: inv });
  } catch (err) { next(err); }
};

/* ── DELETE /api/invoices/:id ────────────────────────────── */
const remove = async (req, res, next) => {
  try {
    const { rows: [inv] } = await db.query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found.' });

    await db.query('DELETE FROM invoices WHERE id = $1', [req.params.id]);

    await logActivity({ adminId: req.admin.id, action: 'DELETE_INVOICE', entityType: 'invoice',
      entityId: req.params.id, description: `Invoice ${inv.invoice_number} deleted by ${req.admin.username}.` });

    res.json({ success: true, message: 'Invoice deleted.' });
  } catch (err) { next(err); }
};

/* ── PATCH /api/invoices/:id/payment ─────────────────────── */
const updatePayment = async (req, res, next) => {
  try {
    const { payment_status, payment_method, reference_number } = req.body;
    const valid = ['pending','partial','paid'];
    if (!valid.includes(payment_status))
      return res.status(400).json({ success: false, message: 'Invalid payment status.' });

    const { rows: [inv] } = await db.query(
      `UPDATE invoices SET payment_status=$1, payment_method=$2, reference_number=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [payment_status, payment_method || null, reference_number?.trim() || null, req.params.id]
    );
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found.' });

    await logActivity({ adminId: req.admin.id, action: 'MARK_PAID', entityType: 'invoice',
      entityId: req.params.id, description: `Invoice ${inv.invoice_number} marked as ${payment_status} by ${req.admin.username}.` });

    res.json({ success: true, data: inv });
  } catch (err) { next(err); }
};

/* ── GET /api/invoices/:id/pdf ───────────────────────────── */
const pdf = async (req, res, next) => {
  try {
    const { rows: [inv] } = await db.query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found.' });

    const { rows: items } = await db.query(
      'SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY sort_order', [req.params.id]
    );
    const biz = await getBiz();

    await generateInvoicePDF(inv, items, biz, res);

    await logActivity({ adminId: req.admin.id, action: 'PRINT_INVOICE', entityType: 'invoice',
      entityId: inv.id, description: `Invoice ${inv.invoice_number} PDF generated by ${req.admin.username}.` });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove, updatePayment, pdf };
