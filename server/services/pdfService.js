/**
 * services/pdfService.js
 * ─────────────────────────────────────────────────────────────
 * PDF generation service using PDFKit.
 *
 * Functions (Phase 7 & 8):
 *
 *   generateQuotationPDF(quotation, items, businessInfo, res)
 *     Streams a formatted A4 PDF quotation to the HTTP response.
 *     Includes: company header, quotation number, customer info,
 *     vehicle info, items table, totals, notes, signature section.
 *
 *   generateInvoicePDF(invoice, items, businessInfo, res)
 *     Streams a formatted A4 PDF invoice to the HTTP response.
 *     Same structure as quotation PDF with invoice branding.
 *
 * PDF Design:
 *   - A4 size (595 x 842 pts)
 *   - Company header with name, address, phone, email
 *   - Document title and number
 *   - Customer and vehicle info block
 *   - Items table with quantity, description, unit price, total
 *   - Subtotal, labour, grand total section
 *   - Notes section
 *   - Signature and date lines
 *   - Footer with page number
 * ─────────────────────────────────────────────────────────────
 * TODO (Phase 7 & 8): Implement PDF generation with PDFKit.
 */

const PDFDocument = require('pdfkit');

/**
 * Generate a quotation PDF and pipe it to the response stream.
 * @param {object} quotation   - quotation header row
 * @param {Array}  items       - quotation_items rows
 * @param {object} businessInfo - business_info row
 * @param {object} res         - Express response object
 */
const generateQuotationPDF = async (quotation, items, businessInfo, res) => {
  // TODO (Phase 7): Implement full PDF layout
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${quotation.quotation_number}.pdf"`
  );

  doc.pipe(res);
  doc.fontSize(20).text('Quotation PDF — coming in Phase 7', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Quotation Number: ${quotation.quotation_number}`);
  doc.end();
};

/**
 * Generate an invoice PDF and pipe it to the response stream.
 * @param {object} invoice     - invoice header row
 * @param {Array}  items       - invoice_items rows
 * @param {object} businessInfo - business_info row
 * @param {object} res         - Express response object
 */
const generateInvoicePDF = async (invoice, items, businessInfo, res) => {
  // TODO (Phase 8): Implement full PDF layout
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${invoice.invoice_number}.pdf"`
  );

  doc.pipe(res);
  doc.fontSize(20).text('Invoice PDF — coming in Phase 8', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Invoice Number: ${invoice.invoice_number}`);
  doc.end();
};

module.exports = { generateQuotationPDF, generateInvoicePDF };
