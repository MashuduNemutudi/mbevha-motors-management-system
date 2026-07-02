/**
 * pages/admin/QuotationFormPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Create / Edit quotation form page.
 *
 * Features (Phase 7):
 *   - Customer info: name, phone
 *   - Vehicle info: make, model, registration
 *   - Dynamic line items table: add / remove rows
 *     Each row: description, qty, unit price, row total (auto)
 *   - Labour cost field
 *   - Notes textarea
 *   - Grand total (auto-calculated)
 *   - Status toggle: Draft / Final
 *   - Save Draft button
 *   - Finalise button
 *   - Generate PDF button (after save)
 *   - Print button
 *
 * Data:
 *   POST /api/quotations       (create)
 *   PUT  /api/quotations/:id   (update)
 *   GET  /api/quotations/:id   (load for edit)
 * ─────────────────────────────────────────────────────────────
 * TODO (Phase 7): Build full quotation form with line items.
 */

const QuotationFormPage = () => (
  <div className="page">
    <div className="page-header">
      <h1 className="page-title">New Quotation</h1>
    </div>
    <div style={{ padding: '40px 0', textAlign: 'center', color: '#adb5bd' }}>
      Quotation form — coming in Phase 7
    </div>
  </div>
);

export default QuotationFormPage;
