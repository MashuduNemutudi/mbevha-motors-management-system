/**
 * pages/admin/BusinessInfoPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Business information editor (admin).
 *
 * Features (Phase 9 — Business Information):
 *   - Edit form for all business_info fields:
 *     Business Name, Motto, Phone, Email, Address,
 *     About text, Opening Hours, WhatsApp, Google Maps Link
 *   - Live character count for text areas
 *   - Save Changes button
 *   - Success / error feedback
 *
 * Data:
 *   GET /api/business
 *   PUT /api/business
 * ─────────────────────────────────────────────────────────────
 * TODO (Phase 9): Implement business info edit form.
 */

const BusinessInfoPage = () => (
  <div className="page">
    <div className="page-header">
      <h1 className="page-title">Business Information</h1>
    </div>
    <div style={{ padding: '40px 0', textAlign: 'center', color: '#adb5bd' }}>
      Business information editor — coming in Phase 9
    </div>
  </div>
);

export default BusinessInfoPage;
