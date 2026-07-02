/**
 * pages/admin/InvoiceFormPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Create / Edit invoice form page.
 *
 * Features (Phase 8):
 *   - Option to link to an existing quotation (pre-fills fields)
 *   - Customer info, vehicle info, line items, labour, notes
 *   - Payment status selector: Pending / Paid
 *   - Generate PDF, Print buttons
 *
 * Data:
 *   POST /api/invoices
 *   PUT  /api/invoices/:id
 *   GET  /api/invoices/:id
 * ─────────────────────────────────────────────────────────────
 * TODO (Phase 8): Build full invoice form.
 */

const InvoiceFormPage = () => (
  <div className="page">
    <div className="page-header">
      <h1 className="page-title">New Invoice</h1>
    </div>
    <div style={{ padding: '40px 0', textAlign: 'center', color: '#adb5bd' }}>
      Invoice form — coming in Phase 8
    </div>
  </div>
);

export default InvoiceFormPage;
