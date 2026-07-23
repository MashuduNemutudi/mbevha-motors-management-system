/**
 * services/numberService.js
 * ─────────────────────────────────────────────────────────────
 * Generates sequential, human-readable document numbers.
 *
 * Format:
 *   Quotations : QT-2026-0001, QT-2026-0002, ...
 *   Invoices   : INV-2026-0001, INV-2026-0002, ...
 *
 * Strategy:
 *   Query the highest existing number for the current year,
 *   increment by 1, and zero-pad to 4 digits.
 *   This is safe for a single-admin, low-concurrency system.
 * ─────────────────────────────────────────────────────────────
 */

const db = require('../config/db');

/**
 * Generate the next quotation number for the current year.
 * @returns {Promise<string>} e.g. "QT-2026-0001"
 */
const nextQuotationNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `QT-${year}-`;

  const { rows } = await db.query(
    `SELECT quotation_number FROM quotations
     WHERE quotation_number LIKE $1
     ORDER BY quotation_number DESC
     LIMIT 1`,
    [`${prefix}%`]
  );

  let sequence = 1;
  if (rows.length > 0) {
    const last = rows[0].quotation_number;
    const lastSeq = parseInt(last.split('-')[2], 10);
    if (!isNaN(lastSeq)) sequence = lastSeq + 1;
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

/**
 * Generate the next invoice number for the current year.
 * @returns {Promise<string>} e.g. "INV-2026-0001"
 */
const nextInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const { rows } = await db.query(
    `SELECT invoice_number FROM invoices
     WHERE invoice_number LIKE $1
     ORDER BY invoice_number DESC
     LIMIT 1`,
    [`${prefix}%`]
  );

  let sequence = 1;
  if (rows.length > 0) {
    const last = rows[0].invoice_number;
    const lastSeq = parseInt(last.split('-')[2], 10);
    if (!isNaN(lastSeq)) sequence = lastSeq + 1;
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`;
};


/**
 * Generate the next job card number for the current year.
 * @returns {Promise<string>} e.g. "JC-2026-0001"
 */
const nextJobCardNumber = async () => {
  const year   = new Date().getFullYear();
  const prefix = `JC-${year}-`;

  const { rows } = await db.query(
    `SELECT job_card_number FROM job_cards
     WHERE  job_card_number LIKE $1
     ORDER  BY job_card_number DESC
     LIMIT  1`,
    [`${prefix}%`]
  );

  let sequence = 1;
  if (rows.length > 0) {
    const lastSeq = parseInt(rows[0].job_card_number.split('-')[2], 10);
    if (!isNaN(lastSeq)) sequence = lastSeq + 1;
  }
  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

// Re-export including new function
module.exports = { nextQuotationNumber, nextInvoiceNumber, nextJobCardNumber };
