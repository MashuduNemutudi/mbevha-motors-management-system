import { useState, useEffect } from 'react';
import { Link }                from 'react-router-dom';
import {
  getDashboardStatsApi,
  getDashboardActivityApi,
  getDashboardChartsApi,
} from '../../api/dashboardApi';
import useAuth         from '../../hooks/useAuth';
import Spinner         from '../../components/common/Spinner';
import { timeAgo, formatDate } from '../../utils/formatDate';
import { formatCurrency }      from '../../utils/formatCurrency';

/* ── Action → icon ──────────────────────────────────────── */
const ACTION_ICONS = {
  ADD_PART: '🔧', UPDATE_PART: '✏️', DELETE_PART: '🗑️',
  UPLOAD_IMAGE: '🖼️', DELETE_IMAGE: '🗑️', UPDATE_CAPTION: '✏️',
  UPDATE_BUSINESS: '🏢', DELETE_MESSAGE: '📨',
  CREATE_QUOTATION: '📄', UPDATE_QUOTATION: '✏️', DELETE_QUOTATION: '🗑️',
  PRINT_QUOTATION: '🖨️',
  CREATE_INVOICE: '🧾', UPDATE_INVOICE: '✏️', DELETE_INVOICE: '🗑️',
  MARK_PAID: '💰', PRINT_INVOICE: '🖨️',
};

/* ── CSS bar chart ──────────────────────────────────────── */
const BarChart = ({ data, valueKey = 'count', labelKey = 'category', color = 'var(--color-primary)' }) => {
  if (!data?.length)
    return <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>No data yet.</p>;
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="dashboard-chart">
      {data.map((item, i) => (
        <div key={i} className="dashboard-chart__row">
          <span className="dashboard-chart__label" title={item[labelKey]}>{item[labelKey]}</span>
          <div className="dashboard-chart__bar-wrap">
            <div className="dashboard-chart__bar"
              style={{ width: `${(item[valueKey] / max) * 100}%`, background: color }} />
          </div>
          <span className="dashboard-chart__value">{item[valueKey]}</span>
        </div>
      ))}
    </div>
  );
};

/* ── SVG donut ──────────────────────────────────────────── */
const AvailabilityChart = ({ avail, unavail }) => {
  const total = avail + unavail;
  const pct   = total > 0 ? Math.round((avail / total) * 100) : 0;
  const circ  = 2 * Math.PI * 36;
  const dash  = (pct / 100) * circ;
  return (
    <div className="avail-chart">
      <svg viewBox="0 0 80 80" width="100" height="100">
        <circle cx="40" cy="40" r="36" fill="none" stroke="var(--color-danger-light)" strokeWidth="10" />
        <circle cx="40" cy="40" r="36" fill="none" stroke="var(--color-success)" strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4}
          strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
        <text x="40" y="44" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text-primary)">{pct}%</text>
      </svg>
      <div className="avail-chart__legend">
        <div className="avail-chart__item">
          <span className="avail-chart__dot" style={{ background: 'var(--color-success)' }} />
          <span>Available ({avail})</span>
        </div>
        <div className="avail-chart__item">
          <span className="avail-chart__dot" style={{ background: 'var(--color-danger)' }} />
          <span>Out of Stock ({unavail})</span>
        </div>
      </div>
    </div>
  );
};

/* ── Stat card ──────────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, color, to, highlight }) => (
  <Link to={to} className={`dashboard-stat-card${highlight ? ' dashboard-stat-card--highlight' : ''}`}>
    <div className="dashboard-stat-card__icon" style={{ background: `${color}18`, color }}>{icon}</div>
    <div className="dashboard-stat-card__content">
      <p className="dashboard-stat-card__label">{label}</p>
      <p className="dashboard-stat-card__value" style={{ color }}>{value}</p>
      <p className="dashboard-stat-card__sub">{sub}</p>
    </div>
  </Link>
);

/* ── Status badge ────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const MAP = {
    draft: 'badge--grey', sent: 'badge--orange',
    approved: 'badge--green', rejected: 'badge--red', converted: 'badge--green',
    pending: 'badge--orange', partial: 'badge--grey', paid: 'badge--green',
  };
  return (
    <span className={`badge ${MAP[status] || 'badge--grey'}`} style={{ textTransform: 'capitalize', fontSize: 10 }}>
      {status}
    </span>
  );
};

const DashboardPage = () => {
  const { admin } = useAuth();
  const [stats,    setStats]    = useState(null);
  const [activity, setActivity] = useState([]);
  const [charts,   setCharts]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [s, a, c] = await Promise.all([
          getDashboardStatsApi(),
          getDashboardActivityApi(12),
          getDashboardChartsApi(),
        ]);
        setStats(s.data.data);
        setActivity(a.data.data || []);
        setCharts(c.data.data);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size="large" /></div>
      </div>
    );
  }

  const s = stats || {};

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, <strong>{admin?.username}</strong></p>
      </div>

      {error && <div className="alert alert--danger" style={{ marginBottom: 24 }}>{error}</div>}

      {/* ── Row 1: Quotations & Invoices ─────────────────── */}
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
        Quotations & Invoices
      </p>
      <div className="dashboard-stats-grid" style={{ marginBottom: 8 }}>
        <StatCard icon="📄" label="Total Quotations"
          value={s.total_quotations ?? '—'}
          sub={`${s.draft_quotations ?? 0} draft · ${s.approved_quotations ?? 0} approved`}
          color="#7c3aed" to="/admin/quotations" />
        <StatCard icon="⏳" label="Pending Quotations"
          value={s.sent_quotations ?? '—'}
          sub="awaiting customer response"
          color="var(--color-warning)"
          highlight={(s.sent_quotations ?? 0) > 0}
          to="/admin/quotations" />
        <StatCard icon="🧾" label="Total Invoices"
          value={s.total_invoices ?? '—'}
          sub={`${s.pending_invoices ?? 0} outstanding`}
          color="var(--color-primary)" to="/admin/invoices" />
        <StatCard icon="💰" label="Monthly Revenue"
          value={s.monthly_revenue != null ? formatCurrency(s.monthly_revenue) : '—'}
          sub="paid invoices this month"
          color="var(--color-success)" to="/admin/invoices" />
      </div>

      {/* ── Row 2: Workshop & Messages ───────────────────── */}
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '16px 0 10px' }}>
        Workshop & Messages
      </p>
      <div className="dashboard-stats-grid" style={{ marginBottom: 24 }}>
        <StatCard icon="🔧" label="Total Parts"
          value={s.total_parts ?? '—'}
          sub={`${s.available_parts ?? 0} available`}
          color="var(--color-primary)" to="/admin/parts" />
        <StatCard icon="✅" label="Available Parts"
          value={s.available_parts ?? '—'}
          sub={`of ${s.total_parts ?? 0} total`}
          color="var(--color-success)" to="/admin/parts" />
        <StatCard icon="🖼️" label="Gallery Images"
          value={s.total_images ?? '—'}
          sub="workshop photos"
          color="#7c3aed" to="/admin/gallery" />
        <StatCard icon="✉️" label="Unread Messages"
          value={s.unread_messages ?? '—'}
          sub={`of ${s.total_messages ?? 0} total`}
          color={s.unread_messages > 0 ? 'var(--color-warning)' : 'var(--color-success)'}
          highlight={s.unread_messages > 0}
          to="/admin/messages" />
      </div>

      {/* ── Lower: Charts + Activity ─────────────────────── */}
      <div className="dashboard-lower">

        {/* Charts column */}
        <div className="dashboard-charts-col">
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 className="dashboard-section-title">Quotations by Status</h3>
            <BarChart
              data={charts?.quotationsByStatus || []}
              labelKey="status" valueKey="count"
              color="#7c3aed"
            />
          </div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 className="dashboard-section-title">Parts by Category</h3>
            <BarChart
              data={charts?.partsByCategory || []}
              labelKey="category" valueKey="count"
              color="var(--color-primary)"
            />
          </div>
          <div className="card">
            <h3 className="dashboard-section-title">Parts Availability</h3>
            <AvailabilityChart
              avail={charts?.partsAvailability?.available   || 0}
              unavail={charts?.partsAvailability?.unavailable || 0}
            />
          </div>
        </div>

        {/* Right column: recent docs + activity */}
        <div className="dashboard-activity-col" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Recent Quotations */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 className="dashboard-section-title" style={{ marginBottom: 0 }}>Recent Quotations</h3>
              <Link to="/admin/quotations" style={{ fontSize: 12, color: 'var(--color-primary)' }}>View all →</Link>
            </div>
            {(charts?.recentQuotations || []).length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '12px 0' }}>No quotations yet.</p>
            ) : (
              <table className="admin-table" style={{ fontSize: 12 }}>
                <thead><tr>
                  <th>Number</th><th>Customer</th><th>Total</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {(charts.recentQuotations || []).map((q, i) => (
                    <tr key={i}>
                      <td><Link to="/admin/quotations" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{q.quotation_number}</Link></td>
                      <td>{q.customer_name}</td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(q.total_amount)}</td>
                      <td><StatusBadge status={q.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Recent Invoices */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 className="dashboard-section-title" style={{ marginBottom: 0 }}>Recent Invoices</h3>
              <Link to="/admin/invoices" style={{ fontSize: 12, color: 'var(--color-primary)' }}>View all →</Link>
            </div>
            {(charts?.recentInvoices || []).length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '12px 0' }}>No invoices yet.</p>
            ) : (
              <table className="admin-table" style={{ fontSize: 12 }}>
                <thead><tr>
                  <th>Number</th><th>Customer</th><th>Total</th><th>Payment</th>
                </tr></thead>
                <tbody>
                  {(charts.recentInvoices || []).map((inv, i) => (
                    <tr key={i}>
                      <td><Link to="/admin/invoices" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{inv.invoice_number}</Link></td>
                      <td>{inv.customer_name}</td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(inv.total_amount)}</td>
                      <td><StatusBadge status={inv.payment_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Activity feed */}
          <div className="card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="dashboard-section-title" style={{ marginBottom: 0 }}>Recent Activity</h3>
              {activity.length > 0 && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last {activity.length}</span>
              )}
            </div>
            {activity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                <p style={{ fontSize: 13 }}>No activity recorded yet.</p>
              </div>
            ) : (
              <div className="activity-feed">
                {activity.map(item => (
                  <div key={item.id} className="activity-item">
                    <div className="activity-item__icon">{ACTION_ICONS[item.action] || '⚡'}</div>
                    <div className="activity-item__body">
                      <p className="activity-item__desc">{item.description}</p>
                      <p className="activity-item__time">{timeAgo(item.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3 className="dashboard-section-title">Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/admin/quotations/new"  className="btn btn-ghost btn-sm">📄 New Quotation</Link>
          <Link to="/admin/invoices/new"    className="btn btn-ghost btn-sm">🧾 New Invoice</Link>
          <Link to="/admin/parts"           className="btn btn-ghost btn-sm">🔧 Manage Parts</Link>
          <Link to="/admin/gallery"         className="btn btn-ghost btn-sm">🖼️ Manage Gallery</Link>
          <Link to="/admin/messages"        className="btn btn-ghost btn-sm">
            ✉️ Messages
            {(s.unread_messages ?? 0) > 0 && (
              <span className="msg-unread-badge" style={{ fontSize: 10, marginLeft: 4 }}>
                {s.unread_messages}
              </span>
            )}
          </Link>
          <Link to="/admin/business-info"  className="btn btn-ghost btn-sm">🏢 Business Info</Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
