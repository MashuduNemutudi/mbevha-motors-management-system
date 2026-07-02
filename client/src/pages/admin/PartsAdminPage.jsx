/**
 * pages/admin/PartsAdminPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Parts management page (admin).
 *
 * Features (Phase 4 — Parts Management):
 *   - Grid / table of all parts
 *   - Add New Part button → modal form
 *   - Edit Part button → modal form with pre-filled values
 *   - Delete Part (with confirmation)
 *   - Image upload via Multer
 *   - Toggle availability (is_available)
 *   - Filter by category
 *
 * Data:
 *   GET    /api/parts
 *   POST   /api/parts        (multipart/form-data with image)
 *   PUT    /api/parts/:id
 *   DELETE /api/parts/:id
 * ─────────────────────────────────────────────────────────────
 * TODO (Phase 4): Implement parts CRUD with image upload.
 */

const PartsAdminPage = () => (
  <div className="page">
    <div className="page-header">
      <h1 className="page-title">Parts Management</h1>
    </div>
    <div style={{ padding: '40px 0', textAlign: 'center', color: '#adb5bd' }}>
      Parts management — coming in Phase 4
    </div>
  </div>
);

export default PartsAdminPage;
