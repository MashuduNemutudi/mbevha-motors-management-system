/**
 * pages/admin/QuotationsPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Quotation list and management page.
 *
 * Features (Phase 7 — Quotations):
 *   - Table of all quotations (number, customer, vehicle, total, status, date)
 *   - Filter by status: All / Draft / Final
 *   - Search by customer name or quotation number
 *   - Create New Quotation button → QuotationFormPage
 *   - Row actions: View / Edit / Delete / Generate PDF / Print
 *   - Status badge: Draft (grey) / Final (green)
 *   - Pagination
 *
 * Data: GET /api/quotations?status=&search=&page=
 * ─────────────────────────────────────────────────────────────
 * TODO (Phase 7): Implement full quotations list and actions.
 */

const QuotationsPage = () => (
  <div className="page">
    <div className="page-header">
      <h1 className="page-title">Quotations</h1>
    </div>
    <div style={{ padding: '40px 0', textAlign: 'center', color: '#adb5bd' }}>
      Quotations management — coming in Phase 7
    </div>
  </div>
);

export default QuotationsPage;
