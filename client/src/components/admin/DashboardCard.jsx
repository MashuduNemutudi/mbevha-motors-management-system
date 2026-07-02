/**
 * components/admin/DashboardCard.jsx
 * ─────────────────────────────────────────────────────────────
 * Summary stat card for the dashboard page.
 *
 * Props:
 *   title  {string}  — e.g. "Total Quotations"
 *   value  {number}  — the stat value
 *   icon   {string}  — emoji or icon component
 *   color  {string}  — CSS class for accent colour
 *   link   {string}  — optional route to navigate to
 *
 * TODO (Phase 10): Wire up with live data from /api/dashboard/stats
 */

const DashboardCard = ({ title, value, icon, color, link }) => (
  <div className={`dashboard-card dashboard-card--${color}`}>
    <div className="dashboard-card__icon">{icon}</div>
    <div className="dashboard-card__content">
      <p className="dashboard-card__title">{title}</p>
      <p className="dashboard-card__value">{value ?? '—'}</p>
    </div>
  </div>
);

export default DashboardCard;
