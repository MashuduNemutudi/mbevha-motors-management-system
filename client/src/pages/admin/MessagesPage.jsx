/**
 * pages/admin/MessagesPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Customer messages / enquiries page (admin).
 *
 * Features (Phase 6 — Messages):
 *   - List of all contact form submissions
 *   - Unread indicator (bold row / badge)
 *   - Click row → mark as read + expand full message
 *   - Customer phone number (click to call or WhatsApp)
 *   - Delete message (with confirmation)
 *   - Filter: All / Unread
 *
 * Data:
 *   GET    /api/messages
 *   PATCH  /api/messages/:id/read
 *   DELETE /api/messages/:id
 * ─────────────────────────────────────────────────────────────
 * TODO (Phase 6): Implement messages list and read/delete.
 */

const MessagesPage = () => (
  <div className="page">
    <div className="page-header">
      <h1 className="page-title">Messages</h1>
    </div>
    <div style={{ padding: '40px 0', textAlign: 'center', color: '#adb5bd' }}>
      Messages management — coming in Phase 6
    </div>
  </div>
);

export default MessagesPage;
