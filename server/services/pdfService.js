/**
 * services/pdfService.js
 * ─────────────────────────────────────────────────────────────
 * PDFKit PDF generation for Mbevha Motors.
 *
 * FONT NOTE: PDFKit standard fonts (Helvetica) only support
 * Latin-1. Emoji corrupt to garbage — use plain ASCII only.
 *
 * Page: A4 portrait  595.28 × 841.89 pts
 * Margins: 45 left/right
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

const PDFDocument = require('pdfkit');
const path        = require('path');
const fs          = require('fs');

/* ── Logo ────────────────────────────────────────────────── */
const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.png');
const HAS_LOGO  = fs.existsSync(LOGO_PATH);

/* ── Colours ─────────────────────────────────────────────── */
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
const CONTENT_W = PAGE_W - ML - MR;

/* ── Helpers ─────────────────────────────────────────────── */
const fmt = (n) => {
  const v = parseFloat(n) || 0;
  return `R ${v.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const safeText = (v) =>
  v == null || String(v).trim() === '' ? '-' : String(v).trim();

const drawRect = (doc, x, y, w, h, fill) =>
  doc.save().rect(x, y, w, h).fillColor(fill).fill().restore();


/* ═══════════════════════════════════════════════════════════
   SHARED HEADER — used by Quotation, Invoice AND Job Card
   Layout (A4 = 595pt wide, margins 45pt each side):
     Left   : logo image (max 84pt wide) at x=45
     Middle : company name + tagline (x=148 onwards)
     Right  : coloured doc-type box + date (last 162pt)
     Bottom : 4 detail lines spanning full content width
   ════════════════════════════════════════════════════════ */
const drawHeader = (doc, biz, docType, docNumber, docDate, expiryDate) => {
  const HEADER_H = 152;

  /* ── Dark background ───────────────────────────────────── */
  drawRect(doc, 0, 0, PAGE_W, HEADER_H, DARK);

  /* ── Logo (top-left, constrained to 84 × 54 pt box) ───── */
  /* Using a fixed-width box so the image never bleeds into  */
  /* the text column regardless of the PNG's internal DPI.   */
  const LOGO_X   = ML;         /* 45  */
  const LOGO_Y   = 22;
  const LOGO_BOX = 84;         /* maximum width for the logo */

  if (HAS_LOGO) {
    doc.image(LOGO_PATH, LOGO_X, LOGO_Y, { width: LOGO_BOX });
  } else {
    /* Fallback: plain red circle with letter M */
    doc.save().circle(LOGO_X + 28, LOGO_Y + 28, 28).fillColor(RED).fill().restore();
    doc.save().fillColor(WHITE).font('Helvetica-Bold').fontSize(22)
       .text('M', LOGO_X + 16, LOGO_Y + 14, { lineBreak: false }).restore();
  }

  /* ── Company name block ────────────────────────────────── */
  /* nameX = LOGO_X + LOGO_BOX + 19 = 45 + 84 + 19 = 148   */
  /* This gives a clear 19 pt gap after the logo box.        */
  const nameX = LOGO_X + LOGO_BOX + 19;
  const nameY = 24;

  doc.save().fillColor(WHITE).font('Helvetica-Bold').fontSize(13.5)
     .text('MBEVHA MOTORS (Pty) Ltd', nameX, nameY, { lineBreak: false }).restore();

  doc.save().fillColor(RED).font('Helvetica-BoldOblique').fontSize(7.5)
     .text('Notable Hands, We Do Quality', nameX, nameY + 18, { lineBreak: false }).restore();

  /* ── Document type box (top-right) ────────────────────── */
  const boxW = 158;
  const boxX = PAGE_W - MR - boxW;   /* 595.28 - 45 - 158 = 392.28 */
  const boxY = 22;

  drawRect(doc, boxX, boxY, boxW, 46, RED);

  doc.save().fillColor(WHITE).font('Helvetica-Bold').fontSize(17)
     .text(docType, boxX, boxY + 7, { width: boxW, align: 'center', lineBreak: false })
     .restore();

  doc.save().fillColor(WHITE).font('Helvetica').fontSize(8)
     .text(docNumber, boxX, boxY + 30, { width: boxW, align: 'center', lineBreak: false })
     .restore();

  /* ── Dates (below the red box) ────────────────────────── */
  const dateY = boxY + 52;
  doc.save().fillColor(WHITE).font('Helvetica').fontSize(7.5)
     .text(`Date: ${docDate}`, boxX, dateY, { width: boxW, align: 'right', lineBreak: false })
     .restore();

  if (expiryDate) {
    doc.save().fillColor(WHITE).font('Helvetica').fontSize(7.5)
       .text(`Valid Until: ${expiryDate}`, boxX, dateY + 12,
             { width: boxW, align: 'right', lineBreak: false })
       .restore();
  }

  /* ── 4 detail lines (full-width, below logo bottom) ───── */
  /* Logo at width=84: height = 84*(193/300) ≈ 54pt          */
  /* Logo bottom = LOGO_Y + 54 = 22 + 54 = 76               */
  /* Detail lines start at y=90 — well clear of logo.        */
  const phone1 = biz.phone          || '0713065615';
  const phone2 = biz.phone_landline || '0107860789';
  const email  = biz.email          || 'mbevhamotors@gmail.com';

  const detailLines = [
    'STAND NO 195 VUWANI ROAD MAHEMATSHENA THOHOYANDOU 0950',
    'PO BOX 405 SHAYANDIMA 0945',
    `CELL: ${phone1}   TEL: ${phone2}   Email: ${email}`,
    'REG NO: 2015/305145/07   TAX REF NO: 9110223220',
  ];

  detailLines.forEach((line, i) => {
    doc.save()
       .fillColor('#CCCCCC')
       .font('Helvetica')
       .fontSize(7)
       .text(line, ML, 90 + i * 14, { width: CONTENT_W, lineBreak: false })
       .restore();
  });

  /* ── Red stripe below header ───────────────────────────── */
  drawRect(doc, 0, HEADER_H, PAGE_W, 4, RED);

  return HEADER_H + 12;   /* first content y-position */
};


/* ═══════════════════════════════════════════════════════════
   INFO BLOCK  (customer + vehicle) — used by quotation & invoice
   ════════════════════════════════════════════════════════ */
const drawInfoBlock = (doc, y, doc_data, isInvoice = false) => {
  const colW   = (CONTENT_W - 12) / 2;
  const leftX  = ML;
  const rightX = ML + colW + 12;
  const boxH   = 118;

  const infoRow = (label, value, iy, ix) => {
    doc.save().fillColor(MID_GREY).font('Helvetica').fontSize(7.5)
       .text(label, ix + 6, iy, { width: 64, lineBreak: false }).restore();
    doc.save().fillColor(DARK).font('Helvetica-Bold').fontSize(8)
       .text(safeText(value), ix + 70, iy, { width: colW - 76, lineBreak: false }).restore();
  };

  /* Customer box */
  drawRect(doc, leftX, y, colW, boxH, ROW_ALT);
  doc.save().rect(leftX, y, colW, boxH).strokeColor(BORDER).lineWidth(0.5).stroke().restore();
  drawRect(doc, leftX, y, colW, 20, RED);
  doc.save().fillColor(WHITE).font('Helvetica-Bold').fontSize(8.5)
     .text('CUSTOMER DETAILS', leftX + 6, y + 6, { lineBreak: false }).restore();

  const cY = y + 26;
  infoRow('Name:',    doc_data.customer_name,   cY,      leftX);
  infoRow('Phone:',   doc_data.phone,            cY + 14, leftX);
  infoRow('Address:', doc_data.customer_address, cY + 28, leftX);
  infoRow('Ref No:',
    isInvoice ? doc_data.invoice_number : doc_data.quotation_number,
    cY + 42, leftX);
  if (isInvoice && doc_data.payment_method)
    infoRow('Payment:', doc_data.payment_method.toUpperCase(), cY + 56, leftX);
  if (isInvoice && doc_data.reference_number)
    infoRow('Ref:', doc_data.reference_number, cY + 70, leftX);

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


/* ═══════════════════════════════════════════════════════════
   PREPARED BY / STATUS PILL
   ════════════════════════════════════════════════════════ */
const drawPreparedBy = (doc, y, preparedBy, status) => {
  const STATUS_COLORS = {
    draft:       [LIGHT_GREY, 'DRAFT'],
    sent:        ['#2980B9',  'SENT'],
    approved:    [GREEN,      'APPROVED'],
    rejected:    [RED,        'REJECTED'],
    converted:   [GREEN,      'CONVERTED'],
    pending:     [ORANGE,     'PENDING'],
    partial:     ['#2980B9',  'PARTIAL PAID'],
    paid:        [GREEN,      'PAID'],
    open:        [ORANGE,     'OPEN'],
    in_progress: ['#2980B9',  'IN PROGRESS'],
    completed:   [GREEN,      'COMPLETED'],
    cancelled:   [RED,        'CANCELLED'],
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


/* ═══════════════════════════════════════════════════════════
   ITEMS TABLE
   ════════════════════════════════════════════════════════ */
const drawItemsTable = (doc, y, items) => {
  const COL = {
    num:   { x: ML,       w: 26  },
    desc:  { x: ML + 26,  w: 233 },
    qty:   { x: ML + 259, w: 46  },
    price: { x: ML + 305, w: 78  },
    total: { x: ML + 383, w: PAGE_W - MR - (ML + 383) },
  };

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
       .text(String(i + 1), COL.num.x + 4, ty, { width: COL.num.w - 8, align: 'center', lineBreak: false }).restore();
    doc.save().fillColor(DARK).font('Helvetica').fontSize(7.5)
       .text(item.description || '', COL.desc.x + 4, ty, { width: COL.desc.w - 8, lineBreak: false }).restore();
    doc.save().fillColor(DARK).font('Helvetica').fontSize(7.5)
       .text(String(item.quantity), COL.qty.x + 4, ty, { width: COL.qty.w - 8, align: 'center', lineBreak: false }).restore();
    doc.save().fillColor(DARK).font('Helvetica').fontSize(7.5)
       .text(fmt(item.unit_price), COL.price.x + 4, ty, { width: COL.price.w - 8, align: 'right', lineBreak: false }).restore();
    doc.save().fillColor(DARK).font('Helvetica-Bold').fontSize(7.5)
       .text(fmt(item.total), COL.total.x + 4, ty, { width: COL.total.w - 8, align: 'right', lineBreak: false }).restore();
    y += ROW_H;
  });

  for (let i = items.length; i < 8; i++) {
    const fill = i % 2 === 0 ? WHITE : ROW_ALT;
    drawRect(doc, ML, y, CONTENT_W, ROW_H, fill);
    doc.save().rect(ML, y, CONTENT_W, ROW_H).strokeColor(BORDER).lineWidth(0.3).stroke().restore();
    y += ROW_H;
  }
  drawRect(doc, ML, y, CONTENT_W, 1, BORDER);
  return y + 8;
};


/* ═══════════════════════════════════════════════════════════
   TOTALS
   ════════════════════════════════════════════════════════ */
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
       .text(label, labelX, y + 5, { lineBreak: false }).restore();
    doc.save().fillColor(fc).font(fn).fontSize(fs)
       .text(value, valueX, y + 5, { width: valueW, align: 'right', lineBreak: false }).restore();
    doc.save().rect(colX, y, colW, highlight ? rowH + 2 : rowH)
       .strokeColor(BORDER).lineWidth(0.3).stroke().restore();
    y += highlight ? rowH + 5 : rowH;
  };

  row('Subtotal (Parts)', fmt(subtotal));
  if (labourCost > 0) row('Labour',   fmt(labourCost));
  if (discount > 0)   row('Discount', `-${fmt(discount)}`);
  if (vatAmount > 0)  row('VAT (15%)', fmt(vatAmount));
  row('GRAND TOTAL', fmt(grandTotal), true, true);
  return y + 8;
};


/* ═══════════════════════════════════════════════════════════
   NOTES
   ════════════════════════════════════════════════════════ */
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


/* ═══════════════════════════════════════════════════════════
   BANKING DETAILS
   ════════════════════════════════════════════════════════ */
const drawBankingDetails = (doc, y) => {
  doc.save().fillColor(DARK).font('Helvetica-Bold').fontSize(9)
     .text('BANKING DETAILS', ML, y).restore();
  y += 5;
  drawRect(doc, ML, y, 160, 1.5, RED);
  y += 8;

  const rows = [
    ['Account Holder:', 'MBEVHA MOTORS (PTY) LTD'],
    ['Bank Name:',      'FNB'],
    ['Account No.:',    '63175320943'],
    ['Branch Code:',    '240204'],
  ];

  rows.forEach(([label, value]) => {
    doc.save().fillColor(MID_GREY).font('Helvetica').fontSize(8)
       .text(label, ML, y, { lineBreak: false }).restore();
    doc.save().fillColor(DARK).font('Helvetica-Bold').fontSize(8)
       .text(value, ML + 88, y, { lineBreak: false }).restore();
    y += 13;
  });
  return y + 4;
};


/* ═══════════════════════════════════════════════════════════
   TERMS & CONDITIONS
   ════════════════════════════════════════════════════════ */
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


/* ═══════════════════════════════════════════════════════════
   SIGNATURE BOXES (quotation & invoice)
   ════════════════════════════════════════════════════════ */
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


/* ═══════════════════════════════════════════════════════════
   FOOTER
   ════════════════════════════════════════════════════════ */
const drawFooter = (doc, biz, docNumber) => {
  const footY = PAGE_H - 34;
  drawRect(doc, 0, footY, PAGE_W, 34, DARK);
  drawRect(doc, 0, footY, PAGE_W, 3, RED);

  const phone1 = biz.phone          || '071 306 5615';
  const phone2 = biz.phone_landline || '010 786 0789';
  const line1  = `${biz.business_name || 'Mbevha Motors (Pty) Ltd'}  |  Stand No 195, Vuwani Rd, Mahematshena  |  Tel: ${phone1}  |  Tel: ${phone2}`;

  doc.save().fillColor('#AAAAAA').font('Helvetica').fontSize(6.5)
     .text(line1, ML, footY + 10, { width: CONTENT_W - 56, lineBreak: false }).restore();

  doc.save().fillColor('#AAAAAA').font('Helvetica-Bold').fontSize(7)
     .text(docNumber, PAGE_W - MR - 55, footY + 10,
           { width: 55, align: 'right', lineBreak: false }).restore();
};


/* ═══════════════════════════════════════════════════════════
   GENERATE QUOTATION PDF
   ════════════════════════════════════════════════════════ */
const generateQuotationPDF = (quotation, items, biz, res) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0, info: {
        Title: quotation.quotation_number, Author: biz.business_name || 'Mbevha Motors', Creator: 'MMMS',
      }});
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${quotation.quotation_number}.pdf"`);
      doc.pipe(res);

      const dateStr   = new Date(quotation.created_at || Date.now())
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
      y = drawBankingDetails(doc, y);
      y += 4;
      y = drawTerms(doc, y);
      y = drawSignatures(doc, y);
      drawFooter(doc, biz, quotation.quotation_number);

      doc.end();
      res.on('finish', resolve);
      res.on('error', reject);
    } catch (err) { reject(err); }
  });


/* ═══════════════════════════════════════════════════════════
   GENERATE INVOICE PDF
   ════════════════════════════════════════════════════════ */
const generateInvoicePDF = (invoice, items, biz, res) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0, info: {
        Title: invoice.invoice_number, Author: biz.business_name || 'Mbevha Motors', Creator: 'MMMS',
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
      y = drawBankingDetails(doc, y);
      y += 4;
      y = drawTerms(doc, y);
      y = drawSignatures(doc, y);
      drawFooter(doc, biz, invoice.invoice_number);

      doc.end();
      res.on('finish', resolve);
      res.on('error', reject);
    } catch (err) { reject(err); }
  });


/* ═══════════════════════════════════════════════════════════
   GENERATE JOB CARD PDF
   Now uses the shared drawHeader — same dark header with logo,
   doc-type box and 4 business detail lines as quotation/invoice.
   ════════════════════════════════════════════════════════ */
const generateJobCardPDF = (card, biz, res) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0, info: {
        Title: card.job_card_number, Author: biz.business_name || 'Mbevha Motors', Creator: 'MMMS',
      }});
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${card.job_card_number}.pdf"`);
      doc.pipe(res);

      const dateStr = card.job_date
        ? new Date(card.job_date).toLocaleDateString('en-ZA',
            { day: '2-digit', month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('en-ZA',
            { day: '2-digit', month: 'long', year: 'numeric' });

      /* ── Shared header (same look as quotation/invoice) ── */
      let y = drawHeader(doc, biz, 'JOB CARD', card.job_card_number, dateStr, null);

      /* ── Status pill + technician ───────────────────────── */
      y = drawPreparedBy(doc, y, card.technician_name ? `Technician: ${card.technician_name}` : null, card.status);

      /* ── Info boxes (vehicle left, owner right) ─────────── */
      const colW  = (CONTENT_W - 12) / 2;
      const leftX = ML;
      const rightX = ML + colW + 12;
      const boxH  = 104;

      const infoRow = (label, value, iy, ix) => {
        doc.save().fillColor(MID_GREY).font('Helvetica').fontSize(7.5)
           .text(label, ix + 6, iy, { width: 68, lineBreak: false }).restore();
        doc.save().fillColor(DARK).font('Helvetica-Bold').fontSize(8)
           .text(safeText(value), ix + 74, iy, { width: colW - 80, lineBreak: false }).restore();
      };

      /* Vehicle box */
      drawRect(doc, leftX, y, colW, boxH, ROW_ALT);
      doc.save().rect(leftX, y, colW, boxH).strokeColor(BORDER).lineWidth(0.5).stroke().restore();
      drawRect(doc, leftX, y, colW, 20, RED);
      doc.save().fillColor(WHITE).font('Helvetica-Bold').fontSize(8.5)
         .text('VEHICLE DETAILS', leftX + 6, y + 6, { lineBreak: false }).restore();
      const vY = y + 26;
      infoRow('Reg No:',       card.registration_number, vY,      leftX);
      infoRow('Vehicle Make:', card.vehicle_make,         vY + 14, leftX);
      infoRow('Colour:',       card.vehicle_colour,       vY + 28, leftX);
      infoRow('VIN Number:',   card.vehicle_vin,          vY + 42, leftX);
      infoRow('Mileage:',      card.mileage,              vY + 56, leftX);

      /* Owner box */
      drawRect(doc, rightX, y, colW, boxH, ROW_ALT);
      doc.save().rect(rightX, y, colW, boxH).strokeColor(BORDER).lineWidth(0.5).stroke().restore();
      drawRect(doc, rightX, y, colW, 20, RED);
      doc.save().fillColor(WHITE).font('Helvetica-Bold').fontSize(8.5)
         .text('OWNER DETAILS', rightX + 6, y + 6, { lineBreak: false }).restore();
      const oY = y + 26;
      infoRow('Owner Name:',   card.owner_name,          oY,      rightX);
      infoRow('ID Number:',    card.id_number,            oY + 14, rightX);
      infoRow('Contact No:',   card.contact_number,       oY + 28, rightX);
      infoRow('Address:',      card.residential_address,  oY + 42, rightX);
      infoRow('Job Card No:',  card.job_card_number,      oY + 56, rightX);

      y += boxH + 10;

      /* ── Job Description box ────────────────────────────── */
      drawRect(doc, ML, y, CONTENT_W, 20, RED);
      doc.save().fillColor(WHITE).font('Helvetica-Bold').fontSize(8.5)
         .text('JOB DESCRIPTION', ML + 6, y + 6, { lineBreak: false }).restore();
      y += 20;
      const descH = 54;
      drawRect(doc, ML, y, CONTENT_W, descH, ROW_ALT);
      doc.save().rect(ML, y, CONTENT_W, descH).strokeColor(BORDER).lineWidth(0.5).stroke().restore();
      if (card.job_description) {
        doc.save().fillColor(DARK).font('Helvetica').fontSize(8)
           .text(card.job_description, ML + 6, y + 6,
                 { width: CONTENT_W - 12, height: descH - 10, lineBreak: true }).restore();
      }
      y += descH + 12;

      /* ── Items checklist ────────────────────────────────── */
      drawRect(doc, ML, y, CONTENT_W, 18, DARK);
      doc.save().fillColor(WHITE).font('Helvetica-Bold').fontSize(8.5)
         .text('ITEMS FOUND IN VEHICLE', ML + 6, y + 5, { lineBreak: false }).restore();
      y += 18;

      drawRect(doc, ML, y, CONTENT_W, 58, ROW_ALT);
      doc.save().rect(ML, y, CONTENT_W, 58).strokeColor(BORDER).lineWidth(0.5).stroke().restore();

      const ALL_ITEMS = [
        ['Key', 'Speakers', 'Seat Covers'],
        ['Radio', 'Car Mats', 'Jack'],
        ['Memory Stick', 'Amplifier', 'Wheel Spanner'],
        ['Warning Triangle', 'Spare Wheel', 'Fire Extinguisher'],
      ];
      const checked = Array.isArray(card.items_checklist) ? card.items_checklist : [];
      const colW4   = CONTENT_W / 4;

      ALL_ITEMS.forEach((col, ci) => {
        col.forEach((item, ri) => {
          const ix        = ML + ci * colW4 + 6;
          const iy        = y + 8 + ri * 16;
          const isChecked = checked.includes(item);
          doc.save().rect(ix, iy, 9, 9).strokeColor(DARK).lineWidth(0.7).stroke().restore();
          if (isChecked) {
            doc.save().fillColor(RED).font('Helvetica-Bold').fontSize(8)
               .text('X', ix + 1.5, iy + 0.5, { lineBreak: false }).restore();
          }
          doc.save().fillColor(DARK).font('Helvetica').fontSize(8)
             .text(item, ix + 13, iy + 0.5, { lineBreak: false }).restore();
        });
      });
      y += 68;

      /* ── Battery Information ─────────────────────────────── */
      drawRect(doc, ML, y, CONTENT_W * 0.6, 18, DARK);
      doc.save().fillColor(WHITE).font('Helvetica-Bold').fontSize(8.5)
         .text('BATTERY INFORMATION', ML + 6, y + 5, { lineBreak: false }).restore();
      y += 18;

      const battW  = CONTENT_W * 0.6;
      const colBW  = battW / 3;
      const headers = ['TYPE', 'COLOR', 'SIZE'];
      const battValues = [card.battery_type, card.battery_colour, card.battery_size];

      headers.forEach((h, i) => {
        const bx = ML + i * colBW;
        drawRect(doc, bx, y, colBW, 16, '#EFEFEF');
        doc.save().rect(bx, y, colBW, 16).strokeColor(BORDER).lineWidth(0.5).stroke().restore();
        doc.save().fillColor(DARK).font('Helvetica-Bold').fontSize(8)
           .text(h, bx, y + 4, { width: colBW, align: 'center', lineBreak: false }).restore();
      });
      y += 16;

      battValues.forEach((v, i) => {
        const bx = ML + i * colBW;
        doc.save().rect(bx, y, colBW, 18).strokeColor(BORDER).lineWidth(0.5).stroke().restore();
        if (v) {
          doc.save().fillColor(DARK).font('Helvetica').fontSize(8)
             .text(v, bx + 4, y + 5, { width: colBW - 8, align: 'center', lineBreak: false }).restore();
        }
      });
      y += 26;

      /* ── Disclaimer ─────────────────────────────────────── */
      drawRect(doc, ML, y, CONTENT_W, 18, DARK);
      doc.save().fillColor(WHITE).font('Helvetica-Bold').fontSize(8.5)
         .text('DISCLAIMER', ML + 6, y + 5, { lineBreak: false }).restore();
      y += 18;

      const disclaimers = [
        'The workshop shall not be liable for loss or damage to vehicles and their contents. All vehicles are left at owner\'s risk.',
        'Vehicles not collected 14 days after service completion will be charged a storage fee of R300 per day.',
        'The workshop does not give guarantee on parts supplied by other suppliers or customer.',
        'The workshop is not responsible for any delay in repair to vehicle due to causes beyond our control.',
      ];

      drawRect(doc, ML, y, CONTENT_W, disclaimers.length * 13 + 8, ROW_ALT);
      doc.save().rect(ML, y, CONTENT_W, disclaimers.length * 13 + 8)
         .strokeColor(BORDER).lineWidth(0.5).stroke().restore();
      y += 6;
      disclaimers.forEach(d => {
        doc.save().fillColor(CHARCOAL).font('Helvetica').fontSize(7.5)
           .text(`• ${d}`, ML + 6, y, { width: CONTENT_W - 12, lineBreak: false }).restore();
        y += 13;
      });
      y += 10;

      /* ── Signature section ──────────────────────────────── */
      drawRect(doc, ML, y, CONTENT_W, 0.5, BORDER);
      y += 10;

      const sigColW = (CONTENT_W - 20) / 3;
      const sigData = [
        { label: 'Received & Checked by:', value: card.received_by || '' },
        { label: 'Owners Signature:', value: '' },
        { label: 'Date:', value: '' },
      ];

      sigData.forEach((sig, i) => {
        const sx   = ML + i * (sigColW + 10);
        const lineY = y + 28;
        doc.save().fillColor(MID_GREY).font('Helvetica').fontSize(7.5)
           .text(sig.label, sx, y, { lineBreak: false }).restore();
        if (sig.value) {
          doc.save().fillColor(DARK).font('Helvetica-Bold').fontSize(8)
             .text(sig.value, sx, y + 12, { width: sigColW, lineBreak: false }).restore();
        }
        /* Signature line */
        doc.save().moveTo(sx, lineY).lineTo(sx + sigColW - 5, lineY)
           .strokeColor(BORDER).lineWidth(0.7).undash().stroke().restore();
      });

      drawFooter(doc, biz, card.job_card_number);

      doc.end();
      res.on('finish', resolve);
      res.on('error', reject);
    } catch (err) { reject(err); }
  });


module.exports = { generateQuotationPDF, generateInvoicePDF, generateJobCardPDF };
