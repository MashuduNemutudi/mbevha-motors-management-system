/**
 * pages/admin/GalleryAdminPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Gallery management page (admin).
 *
 * Features (Phase 5 — Gallery Management):
 *   - Grid of uploaded images with captions
 *   - Upload New Image button (file picker)
 *   - Edit Caption inline
 *   - Delete Image (with confirmation + server file removal)
 *
 * Data:
 *   GET    /api/gallery
 *   POST   /api/gallery       (multipart/form-data)
 *   PATCH  /api/gallery/:id   (update caption)
 *   DELETE /api/gallery/:id
 * ─────────────────────────────────────────────────────────────
 * TODO (Phase 5): Implement gallery CRUD with image upload.
 */

const GalleryAdminPage = () => (
  <div className="page">
    <div className="page-header">
      <h1 className="page-title">Gallery Management</h1>
    </div>
    <div style={{ padding: '40px 0', textAlign: 'center', color: '#adb5bd' }}>
      Gallery management — coming in Phase 5
    </div>
  </div>
);

export default GalleryAdminPage;
