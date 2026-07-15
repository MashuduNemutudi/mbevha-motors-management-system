/**
 * services/pdfService.js
 * ─────────────────────────────────────────────────────────────
 * PDFKit-based PDF generation for Mbevha Motors.
 *
 * IMPORTANT FONT NOTE:
 *   PDFKit standard fonts (Helvetica, Times, Courier) only support
 *   Latin-1 characters. Emoji and Unicode icons (📍📞📲⚙) are NOT
 *   supported and render as garbage characters (Ø=ÜÍ etc.).
 *   All icons are therefore replaced with plain text labels.
 *
 * Page: A4 portrait  595.28 × 841.89 pts
 * Margins: 45 left/right, 40 top
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

const PDFDocument = require('pdfkit');
const path        = require('path');
const fs          = require('fs');

/* ── Logo path ───────────────────────────────────────────── */
const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.png');
const HAS_LOGO  = fs.existsSync(LOGO_PATH);

/* ── Brand colours ───────────────────────────────────────── */
const RED        = '#CC1C1C';
const DARK       = '#1a1a1a';
const CHARCOAL   = '#333333';
const MID_GREY   = '#666666';
const LIGHT_GREY = '#999999';
const ROW_ALT    = '#F8F8F8';
const BORDER     = '#E0E0E0';
const WHITE      = '#FFFFFF';
const GREEN      = '#27AE60';
const ORANGE     = '#E67E22';

/* ── Page constants ──────────────────────────────────────── */
const PAGE_W    = 595.28;
const PAGE_H    = 841.89;
const ML        = 45;
const MR        = 45;
const MT        = 40;
const CONTENT_W = PAGE_W - ML - MR;

/* ── Helpers ─────────────────────────────────────────────── */
const fmt = (n) => {
  const v = parseFloat(n) || 0;
  return `R ${v.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const safeText = (v) =>
  v == null || String(v).trim() === '' ? '-' : String(v).trim();

const drawRect = (doc, x, y, w, h, fill) => {
  doc.save().rect(x, y, w, h).fillColor(fill).fill().restore();
};

/* ── HEADER ──────────────────────────────────────────────── */
const drawHeader = (doc, biz, docType, docNumber, docDate, expiryDate) => {
  const HEADER_H = 125;

  /* Dark background */
  drawRect(doc, 0, 0, PAGE_W, HEADER_H, DARK);

  /* ── Logo (left side) ─────────────────────────────────── */
  const LOGO_X = ML;
  const LOGO_Y = MT - 10;
  const LOGO_H = 68;   // height in pts to render at
  const LOGO_W = 106;  // 300x193 ratio → 106 wide at 68 tall

  if (HAS_LOGO) {
    doc.image(LOGO_PATH, LOGO_X, LOGO_Y, { height: LOGO_H });
  } else {
    /* Fallback: red circle with gear text */
    doc.save().circle(LOGO_X + 28, LOGO_Y + 28, 28).fillColor(RED).fill().restore();
    doc.save().fillColor(WHITE).font('Helvetica-Bold').fontSize(22)
       .text('M', LOGO_X + 16, LOGO_Y + 16, { lineBreak: false }).restore();
  }

  /* ── Business name (right of logo) ───────────────────── */
  const nameX = LOGO_X + LOGO_W + 10;
  const nameY = MT;

  doc.save()
     .fillColor(WHITE)
     .font('Helvetica-Bold')
     .fontSize(15)
     .text('MBEVHA MOTORS', nameX, nameY, { lineBreak: false })
     .restore();

  doc.save()
     .fillColor(WHITE)
     .font('Helvetica')
     .fontSize(8)
     .text('(Pty) Ltd', nameX, nameY + 20, { lineBreak: false })
     .restore();

  doc.save()
     .fillColor(RED)
     .font('Helvetica-BoldOblique')
     .fontSize(7.5)
     .text('Notable Hands, We Do Quality', nameX, nameY + 33, { lineBreak: false })
     .restore();

  /* ── Document type box (top-right) ───────────────────── */
  const boxW = 165;
  const boxX = PAGE_W - MR - boxW;
  const boxY = MT - 10;

  drawRect(doc, boxX, boxY, boxW, 46, RED);

  doc.save()
     .fillColor(WHITE)
     .font('Helvetica-Bold')
     .fontSize(17)
     .text(docType, boxX, boxY + 7, { width: boxW, align: 'center', lineBreak: false })
     .restore();

  doc.save()
     .fillColor(WHITE)
     .font('Helvetica')
     .fontSize(8.5)
     .text(docNumber, boxX, boxY + 30, { width: boxW, align: 'center', lineBreak: false })
     .restore();

  /* ── Dates below the box ──────────────────────────────── */
  const dateY = boxY + 53;
  doc.save()
     .fillColor(WHITE)
     .font('Helvetica')
     .fontSize(7.5)
     .text(`Date: ${docDate}`, boxX, dateY, { width: boxW, align: 'right', lineBreak: false })
     .restore();

  if (expiryDate) {
    doc.save()
       .fillColor(WHITE)
       .font('Helvetica')
       .fontSize(7.5)
       .text(`Valid Until: ${expiryDate}`, boxX, dateY + 12, { width: boxW, align: 'right', lineBreak: false })
       .restore();
  }

  /* ── Contact details row (bottom of dark header) ─────── */
  // Use plain ASCII labels — NO emoji (they corrupt in Helvetica)
  const addr    = biz.address          || 'Mahematshena, Vuwani Road';
  const phone   = biz.phone            || '0713065615';
  const wa      = biz.whatsapp_number  || '0615188643';
  const ctLine  = `Addr: ${addr}   Tel: ${phone}   WA: ${wa}`;

  /* Contact line — sits below logo, clearly visible in white */
  doc.save()
     .fillColor('#FFFFFF')
     .font('Helvetica')
     .fontSize(8)
     .text(ctLine, ML, 102, { width: CONTENT_W, lineBreak: false })
     .restore();

  /* Red stripe below header */
  drawRect(doc, 0, HEADER_H, PAGE_W, 4, RED);

  return HEADER_H + 12; // y after header
};

/* ── INFO BLOCK (customer + vehicle) ─────────────────────── */
const drawInfoBlock = (doc, y, doc_data, isInvoice = false) => {
  const colW  = (CONTENT_W - 12) / 2;
  const leftX  = ML;
  const rightX = ML + colW + 12;
  const boxH   = 118;

  const infoRow = (label, value, iy, ix) => {
    doc.save()
       .fillColor(MID_GREY).font('Helvetica').fontSize(7.5)
       .text(label, ix + 6, iy, { width: 64, lineBreak: false })
       .restore();
    doc.save()
       .fillColor(DARK).font('Helvetica-Bold').fontSize(8)
       .text(safeText(value), ix + 70, iy, { width: colW - 76, lineBreak: false })
       .restore();
  };

  /* Customer box */
  drawRect(doc, leftX, y, colW, boxH, ROW_ALT);
  doc.save().rect(leftX, y, colW, boxH).strokeColor(BORDER).lineWidth(0.5).stroke().restore();
  drawRect(doc, leftX, y, colW, 20, RED);
  doc.save().fillColor(WHITE).font('Helvetica-Bold').fontSize(8.5)
     .text('CUSTOMER DETAILS', leftX + 6, y + 6, { lineBreak: false }).restore();

  const cY = y + 26;
  infoRow('Name:',    doc_data.customer_name,    cY,      leftX);
  infoRow('Phone:',   doc_data.phone,             cY + 14, leftX);
  infoRow('Address:', doc_data.customer_address,  cY + 28, leftX);
  infoRow('Ref No:',  isInvoice ? doc_data.invoice_number : doc_data.quotation_number, cY + 42, leftX);
  if (isInvoice && doc_data.payment_method) {
    infoRow('Payment:', doc_data.payment_method.toUpperCase(), cY + 56, leftX);
  }
  if (isInvoice && doc_data.reference_number) {
    infoRow('Ref:', doc_data.reference_number, cY + 70, leftX);
  }

  /* Vehicle box */
  drawRect(doc, rightX, y, colW, boxH, ROW_ALT);
  doc.save().rect(rightX, y, colW, boxH).strokeColor(BORDER).lineWidth(0.5).stroke().restore();
  drawRect(doc, rightX, y, colW, 20, RED);
  doc.save().fillColor(WHITE).font('Helvetica-Bold').fontSize(8.5)
     .text('VEHICLE DETAILS', rightX + 6, y + 6, { lineBreak: false }).restore();

  const vY = y + 26;
  infoRow('Reg No:',  doc_data.registration_number, vY,      rightX);
  infoRow('Make:',    doc_data.vehicle_make,         vY + 14, rightX);
  infoRow('Model:',   doc_data.vehicle_model,        vY + 28, rightX);
  infoRow('Colour:',  doc_data.vehicle_colour,       vY + 42, rightX);
  infoRow('VIN:',     doc_data.vehicle_vin,          vY + 56, rightX);
  infoRow('Mileage:', doc_data.mileage,              vY + 70, rightX);

  return y + boxH + 12;
};

/* ── PREPARED BY + STATUS PILL ───────────────────────────── */
const drawPreparedBy = (doc, y, preparedBy, status) => {
  const STATUS_COLORS = {
    draft:     [LIGHT_GREY, 'DRAFT'],
    sent:      ['#2980B9',  'SENT'],
    approved:  [GREEN,      'APPROVED'],
    rejected:  [RED,        'REJECTED'],
    converted: [GREEN,      'CONVERTED'],
    pending:   [ORANGE,     'PENDING'],
    partial:   ['#2980B9',  'PARTIAL PAID'],
    paid:      [GREEN,      'PAID'],
  };
  const [color, label] = STATUS_COLORS[status] || [MID_GREY, (status || '').toUpperCase()];

  if (preparedBy) {
    doc.save()
       .fillColor(MID_GREY).font('Helvetica').fontSize(8)
       .text('Prepared by: ', ML, y + 3, { lineBreak: false, continued: true })
       .fillColor(DARK).font('Helvetica-Bold')
       .text(preparedBy, { lineBreak: false })
       .restore();
  }

  const pillW = 96;
  const pillX = PAGE_W - MR - pillW;
  drawRect(doc, pillX, y, pillW, 20, `${color}22`);
  doc.save().rect(pillX, y, pillW, 20).strokeColor(color).lineWidth(1).stroke().restore();
  doc.save().fillColor(color).font('Helvetica-Bold').fontSize(8)
     .text(label, pillX, y + 6, { width: pillW, align: 'center', lineBreak: false }).restore();

  return y + 28;
};

/* ── ITEMS TABLE ─────────────────────────────────────────── */
const drawItemsTable = (doc, y, items) => {
  const COL = {
    num:   { x: ML,           w: 26  },
    desc:  { x: ML + 26,      w: 233 },
    qty:   { x: ML + 259,     w: 46  },
    price: { x: ML + 305,     w: 78  },
    total: { x: ML + 383,     w: PAGE_W - MR - (ML + 383) },
  };

  /* Header row */
  drawRect(doc, ML, y, CONTENT_W, 22, DARK);
  const hdr = (text, col, align = 'left') =>
    doc.save().fillColor(WHITE).font('Helvetica-Bold').fontSize(7.5)
       .text(text, col.x + 4, y + 7, { width: col.w - 8, align, lineBreak: false }).restore();

  hdr('#',           COL.num,   'center');
  hdr('DESCRIPTION', COL.desc);
  hdr('QTY',         COL.qty,   'center');
  hdr('UNIT PRICE',  COL.price, 'right');
  hdr('TOTAL',       COL.total, 'right');
  y += 22;

  const ROW_H = 22;

  items.forEach((item, i) => {
    const fill = i % 2 === 0 ? WHITE : ROW_ALT;
    drawRect(doc, ML, y, CONTENT_W, ROW_H, fill);
    doc.save().rect(ML, y, CONTENT_W, ROW_H).strokeColor(BORDER).lineWidth(0.3).stroke().restore();

    const ty = y + 7;
    doc.save().fillColor(MID_GREY).font('Helvetica').fontSize(7.5)
       .text(String(i + 1), COL.num.x + 4,   ty, { width: COL.num.w - 8,   align: 'center', lineBreak: false }).restore();
    doc.save().fillColor(DARK).font('Helvetica').fontSize(7.5)
       .text(item.description || '', COL.desc.x + 4,  ty, { width: COL.desc.w - 8,  lineBreak: false }).restore();
    doc.save().fillColor(DARK).font('Helvetica').fontSize(7.5)
       .text(String(item.quantity), COL.qty.x + 4, ty, { width: COL.qty.w - 8, align: 'center', lineBreak: false }).restore();
    doc.save().fillColor(DARK).font('Helvetica').fontSize(7.5)
       .text(fmt(item.unit_price), COL.price.x + 4, ty, { width: COL.price.w - 8, align: 'right', lineBreak: false }).restore();
    doc.save().fillColor(DARK).font('Helvetica-Bold').fontSize(7.5)
       .text(fmt(item.total), COL.total.x + 4, ty, { width: COL.total.w - 8, align: 'right', lineBreak: false }).restore();

    y += ROW_H;
  });

  /* Pad to minimum 8 rows */
  for (let i = items.length; i < 8; i++) {
    const fill = i % 2 === 0 ? WHITE : ROW_ALT;
    drawRect(doc, ML, y, CONTENT_W, ROW_H, fill);
    doc.save().rect(ML, y, CONTENT_W, ROW_H).strokeColor(BORDER).lineWidth(0.3).stroke().restore();
    y += ROW_H;
  }

  drawRect(doc, ML, y, CONTENT_W, 1, BORDER);
  return y + 8;
};

/* ── TOTALS ──────────────────────────────────────────────── */
const drawTotals = (doc, y, subtotal, discount, vatAmount, grandTotal, labourCost) => {
  const colW   = 225;
  const colX   = PAGE_W - MR - colW;
  const rowH   = 19;
  const labelX = colX + 8;
  const valueW = 68;
  const valueX = colX + colW - valueW - 6;

  const row = (label, value, bold = false, highlight = false) => {
    if (highlight) drawRect(doc, colX, y, colW, rowH + 2, RED);
    else if (bold)  drawRect(doc, colX, y, colW, rowH, '#F0F0F0');

    const fc = highlight ? WHITE : (bold ? DARK : CHARCOAL);
    const fn = (bold || highlight) ? 'Helvetica-Bold' : 'Helvetica';
    const fs = highlight ? 9.5 : 8;

    doc.save().fillColor(fc).font(fn).fontSize(fs)
       .text(label, labelX, y + (highlight ? 5 : 5), { lineBreak: false }).restore();
    doc.save().fillColor(fc).font(fn).fontSize(fs)
       .text(value, valueX, y + (highlight ? 5 : 5), { width: valueW, align: 'right', lineBreak: false }).restore();
    doc.save().rect(colX, y, colW, highlight ? rowH + 2 : rowH)
       .strokeColor(BORDER).lineWidth(0.3).stroke().restore();

    y += highlight ? rowH + 5 : rowH;
  };

  row('Subtotal (Parts)',  fmt(subtotal));
  if (labourCost > 0) row('Labour',         fmt(labourCost));
  if (discount > 0)   row('Discount',       `-${fmt(discount)}`);
  if (vatAmount > 0)  row('VAT (15%)',      fmt(vatAmount));
  row('GRAND TOTAL',      fmt(grandTotal), true, true);

  return y + 8;
};

/* ── NOTES ───────────────────────────────────────────────── */
const drawNotes = (doc, y, notes) => {
  if (!notes || !notes.trim()) return y;

  doc.save().fillColor(DARK).font('Helvetica-Bold').fontSize(8)
     .text('NOTES', ML, y).restore();
  y += 12;
  drawRect(doc, ML, y, CONTENT_W * 0.55, 0.5, RED);
  y += 5;
  doc.save().fillColor(CHARCOAL).font('Helvetica').fontSize(7.5)
     .text(notes.trim(), ML, y, { width: CONTENT_W * 0.55, lineBreak: true }).restore();

  return doc.y + 10;
};

/* ── TERMS ───────────────────────────────────────────────── */
const drawTerms = (doc, y) => {
  doc.save().fillColor(DARK).font('Helvetica-Bold').fontSize(8)
     .text('TERMS & CONDITIONS', ML, y).restore();
  y += 12;
  drawRect(doc, ML, y, CONTENT_W, 0.5, RED);
  y += 5;

  const terms = [
    '1. This quotation is valid for 30 days from the date of issue unless otherwise stated.',
    '2. All prices are in South African Rand (ZAR). VAT is charged at the current applicable rate.',
    '3. Work will only commence upon written approval of this quotation.',
    '4. Parts remain the property of Mbevha Motors until full payment is received.',
    '5. Vehicles left on premises beyond 30 days may be subject to storage charges.',
    '6. Mbevha Motors is not responsible for any pre-existing damage not noted at vehicle intake.',
  ];

  terms.forEach(t => {
    doc.save().fillColor(MID_GREY).font('Helvetica').fontSize(6.5)
       .text(t, ML, y, { width: CONTENT_W }).restore();
    y += 10;
  });

  return y + 4;
};

/* ── SIGNATURES ──────────────────────────────────────────── */
const drawSignatures = (doc, y) => {
  const colW = (CONTENT_W / 2) - 14;
  const SIG_H = 42;

  doc.save().rect(ML, y, colW, SIG_H).strokeColor(BORDER).lineWidth(0.5).stroke().restore();
  doc.save().fillColor(LIGHT_GREY).font('Helvetica').fontSize(7)
     .text('Authorised Signature:', ML + 6, y + 6, { lineBreak: false }).restore();
  doc.save().fillColor(LIGHT_GREY).font('Helvetica').fontSize(7)
     .text('Mbevha Motors (Pty) Ltd', ML + 6, y + 30, { lineBreak: false }).restore();

  const rx = ML + colW + 28;
  doc.save().rect(rx, y, colW, SIG_H).strokeColor(BORDER).lineWidth(0.5).stroke().restore();
  doc.save().fillColor(LIGHT_GREY).font('Helvetica').fontSize(7)
     .text('Customer Signature:', rx + 6, y + 6, { lineBreak: false }).restore();
  doc.save().fillColor(LIGHT_GREY).font('Helvetica').fontSize(7)
     .text('Date: ___________________', rx + 6, y + 30, { lineBreak: false }).restore();

  return y + SIG_H + 10;
};

/* ── FOOTER ──────────────────────────────────────────────── */
const drawFooter = (doc, biz, docNumber) => {
  const footY = PAGE_H - 34;

  drawRect(doc, 0, footY, PAGE_W, 34, DARK);
  drawRect(doc, 0, footY, PAGE_W, 3,  RED);   /* Red top stripe on footer */

  const line1 = `${biz.business_name || 'Mbevha Motors (Pty) Ltd'}  |  ${biz.address || 'Mahematshena, Dzwerani'}  |  Tel: ${biz.phone || '0713065615'}  |  WA: ${biz.whatsapp_number || '0615188643'}`;

  doc.save()
     .fillColor('#AAAAAA')
     .font('Helvetica')
     .fontSize(6.5)
     .text(line1, ML, footY + 10, { width: CONTENT_W - 56, lineBreak: false })
     .restore();

  doc.save()
     .fillColor('#AAAAAA')
     .font('Helvetica-Bold')
     .fontSize(7)
     .text(docNumber, PAGE_W - MR - 55, footY + 10, { width: 55, align: 'right', lineBreak: false })
     .restore();
};

/* ── PUBLIC API ──────────────────────────────────────────── */
const generateQuotationPDF = (quotation, items, biz, res) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0, info: {
        Title:   quotation.quotation_number,
        Author:  biz.business_name || 'Mbevha Motors',
        Creator: 'MMMS',
      }});

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${quotation.quotation_number}.pdf"`);
      doc.pipe(res);

      const dateStr = new Date(quotation.created_at || Date.now())
        .toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' });
      const expiryStr = quotation.expiry_date
        ? new Date(quotation.expiry_date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })
        : null;

      let y = drawHeader(doc, biz, 'QUOTATION', quotation.quotation_number, dateStr, expiryStr);
      y = drawInfoBlock(doc, y, quotation, false);
      y = drawPreparedBy(doc, y, quotation.prepared_by, quotation.status);
      y = drawItemsTable(doc, y, items || []);

      const subtotal   = (items || []).reduce((s, r) => s + parseFloat(r.total || 0), 0);
      const labour     = parseFloat(quotation.labour_cost) || 0;
      const discount   = parseFloat(quotation.discount)    || 0;
      const vatAmount  = parseFloat(quotation.vat_amount)  || 0;
      const grandTotal = parseFloat(quotation.total_amount) || (subtotal + labour - discount + vatAmount);

      const totalsY    = y;
      const totalsEndY = drawTotals(doc, totalsY, subtotal, discount, vatAmount, grandTotal, labour);

      drawNotes(doc, totalsY, quotation.notes);

      y = Math.max(totalsEndY, doc.y + 8);
      y = drawTerms(doc, y);
      y = drawSignatures(doc, y);
      drawFooter(doc, biz, quotation.quotation_number);

      doc.end();
      res.on('finish', resolve);
      res.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });

const generateInvoicePDF = (invoice, items, biz, res) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0, info: {
        Title:   invoice.invoice_number,
        Author:  biz.business_name || 'Mbevha Motors',
        Creator: 'MMMS',
      }});

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${invoice.invoice_number}.pdf"`);
      doc.pipe(res);

      const dateStr = new Date(invoice.invoice_date || invoice.created_at || Date.now())
        .toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' });

      let y = drawHeader(doc, biz, 'TAX INVOICE', invoice.invoice_number, dateStr, null);
      y = drawInfoBlock(doc, y, invoice, true);
      y = drawPreparedBy(doc, y, invoice.prepared_by, invoice.payment_status);
      y = drawItemsTable(doc, y, items || []);

      const subtotal   = (items || []).reduce((s, r) => s + parseFloat(r.total || 0), 0);
      const labour     = parseFloat(invoice.labour_cost) || 0;
      const discount   = parseFloat(invoice.discount)    || 0;
      const vatAmount  = parseFloat(invoice.vat_amount)  || 0;
      const grandTotal = parseFloat(invoice.total_amount) || (subtotal + labour - discount + vatAmount);

      const totalsY    = y;
      const totalsEndY = drawTotals(doc, totalsY, subtotal, discount, vatAmount, grandTotal, labour);

      drawNotes(doc, totalsY, invoice.notes);
      y = Math.max(totalsEndY, doc.y + 8);
      y = drawTerms(doc, y);
      y = drawSignatures(doc, y);
      drawFooter(doc, biz, invoice.invoice_number);

      doc.end();
      res.on('finish', resolve);
      res.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });

module.exports = { generateQuotationPDF, generateInvoicePDF };
