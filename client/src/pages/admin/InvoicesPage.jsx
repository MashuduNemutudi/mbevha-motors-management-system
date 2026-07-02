/**
 * pages/admin/InvoicesPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Invoice list and management page.
 *
 * Features (Phase 8 — Invoices):
 *   - Table of all invoices (number, customer, total, payment status, date)
 *   - Filter by payment status: All / Pending / Paid
 *   - Search by customer or invoice number
 *   - Create New Invoice button
 *   - Row actions: View / Edit / Mark as Paid / Generate PDF / Print / Delete
 *   - Payment status badge: Pending (orange) / Paid (green)
 *
 * Data: GET /api/invoices?status=&search=&page=
 * ─────────────────────────────────────────────────────────────
 * TODO (Phase 8): Implement full invoices list and actions.
 */

const InvoicesPage = () => (
  <div className="page">
    <div className="page-header">
      <h1 className="page-title">Invoices</h1>
    </div>
    <div style={{ padding: '40px 0', textAlign: 'center', color: '#adb5bd' }}>
      Invoices management — coming in Phase 8
    </div>
  </div>
);

export default InvoicesPage;
