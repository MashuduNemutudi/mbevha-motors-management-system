/**
 * pages/admin/DashboardPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Admin dashboard home — summary cards + activity feed.
 *
 * Features (Phase 10 — Dashboard):
 *   - Summary cards: Total Quotations, Total Invoices,
 *     Total Parts, Gallery Images, Unread Messages
 *   - Recent Activity feed from activity_logs table
 *   - Quick action buttons
 *
 * Data:
 *   GET /api/dashboard/stats
 *   GET /api/dashboard/activity
 * ─────────────────────────────────────────────────────────────
 * TODO (Phase 10): Implement stats cards and activity feed.
 */

const DashboardPage = () => (
  <div className="page">
    <div className="page-header">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Welcome back to Mbevha Motors Management System</p>
    </div>
    <div style={{ padding: '40px 0', textAlign: 'center', color: '#adb5bd' }}>
      Dashboard stats and activity feed — coming in Phase 10
    </div>
  </div>
);

export default DashboardPage;
