import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getDashboardStatsApi,
  getDashboardActivityApi,
  getDashboardChartsApi,
} from '../../api/dashboardApi';
import useAuth            from '../../hooks/useAuth';
import Spinner            from '../../components/common/Spinner';
import { timeAgo }        from '../../utils/formatDate';

/* ── Action label → icon map ────────────────────────────── */
const ACTION_ICONS = {
  ADD_PART:        '🔧',
  UPDATE_PART:     '✏️',
  DELETE_PART:     '🗑️',
  UPLOAD_IMAGE:    '🖼️',
  DELETE_IMAGE:    '🗑️',
  UPDATE_CAPTION:  '✏️',
  UPDATE_BUSINESS: '🏢',
  DELETE_MESSAGE:  '📨',
  CREATE_QUOTATION:'📄',
  UPDATE_QUOTATION:'✏️',
  DELETE_QUOTATION:'🗑️',
  CREATE_INVOICE:  '🧾',
  UPDATE_INVOICE:  '✏️',
  DELETE_INVOICE:  '🗑️',
};

/* ── Simple bar chart rendered with CSS ─────────────────── */
const BarChart = ({ data, valueKey = 'count', labelKey = 'category', color = 'var(--color-primary)' }) => {
  if (!data || data.length === 0)
    return <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>No data yet.</p>;

  const max = Math.max(...data.map(d => d[valueKey]), 1);

  return (
    <div className="dashboard-chart">
      {data.map((item, i) => (
        <div key={i} className="dashboard-chart__row">
          <span className="dashboard-chart__label" title={item[labelKey]}>
            {item[labelKey]}
          </span>
          <div className="dashboard-chart__bar-wrap">
            <div
              className="dashboard-chart__bar"
              style={{ width: `${(item[valueKey] / max) * 100}%`, background: color }}
            />
          </div>
          <span className="dashboard-chart__value">{item[valueKey]}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Donut-style availability display ───────────────────── */
const AvailabilityChart = ({ avail, unavail }) => {
  const total    = avail + unavail;
  const pct      = total > 0 ? Math.round((avail / total) * 100) : 0;
  const circumference = 2 * Math.PI * 36;
  const dash     = (pct / 100) * circumference;

  return (
    <div className="avail-chart">
      <svg viewBox="0 0 80 80" width="100" height="100">
        <circle cx="40" cy="40" r="36" fill="none"
          stroke="var(--color-danger-light)" strokeWidth="10" />
        <circle cx="40" cy="40" r="36" fill="none"
          stroke="var(--color-success)" strokeWidth="10"
          strokeDasharray={`${dash} ${circumference}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
        <text x="40" y="44" textAnchor="middle"
          fontSize="16" fontWeight="700" fill="var(--text-primary)">
          {pct}%
        </text>
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

const DashboardPage = () => {
  const { admin } = useAuth();

  const [stats,    setStats]    = useState(null);
  const [activity, setActivity] = useState([]);
  const [charts,   setCharts]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, activityRes, chartsRes] = await Promise.all([
          getDashboardStatsApi(),
          getDashboardActivityApi(12),
          getDashboardChartsApi(),
        ]);
        setStats(statsRes.data.data);
        setActivity(activityRes.data.data || []);
        setCharts(chartsRes.data.data);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Welcome back, <strong>{admin?.username}</strong>
          {' — '}Mbevha Motors Management System
        </p>
      </div>

      {error && <div className="alert alert--danger" style={{ marginBottom: 24 }}>{error}</div>}

      {/* ── Stat cards ─────────────────────────────────── */}
      <div className="dashboard-stats-grid">
        <StatCard
          icon="🔧"
          label="Total Parts"
          value={stats?.total_parts ?? '—'}
          sub={`${stats?.available_parts ?? 0} available`}
          color="var(--color-primary)"
          to="/admin/parts"
        />
        <StatCard
          icon="✅"
          label="Available Parts"
          value={stats?.available_parts ?? '—'}
          sub={`of ${stats?.total_parts ?? 0} total`}
          color="var(--color-success)"
          to="/admin/parts"
        />
        <StatCard
          icon="🖼️"
          label="Gallery Images"
          value={stats?.total_images ?? '—'}
          sub="in the workshop gallery"
          color="#7c3aed"
          to="/admin/gallery"
        />
        <StatCard
          icon="✉️"
          label="Unread Messages"
          value={stats?.unread_messages ?? '—'}
          sub={`of ${stats?.total_messages ?? 0} total`}
          color={stats?.unread_messages > 0 ? 'var(--color-warning)' : 'var(--color-success)'}
          to="/admin/messages"
          highlight={stats?.unread_messages > 0}
        />
      </div>

      {/* ── Charts + Activity ────────────────────────────── */}
      <div className="dashboard-lower">

        {/* Charts column */}
        <div className="dashboard-charts-col">

          {/* Parts by category */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 className="dashboard-section-title">Parts by Category</h3>
            <BarChart
              data={charts?.partsByCategory || []}
              labelKey="category"
              valueKey="count"
              color="var(--color-primary)"
            />
          </div>

          {/* Availability donut */}
          <div className="card">
            <h3 className="dashboard-section-title">Parts Availability</h3>
            <AvailabilityChart
              avail={charts?.partsAvailability?.available   || 0}
              unavail={charts?.partsAvailability?.unavailable || 0}
            />
          </div>
        </div>

        {/* Activity feed column */}
        <div className="dashboard-activity-col">
          <div className="card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="dashboard-section-title" style={{ marginBottom: 0 }}>Recent Activity</h3>
              {activity.length > 0 && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Showing last {activity.length}
                </span>
              )}
            </div>

            {activity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <p style={{ fontSize: 13 }}>No activity recorded yet.</p>
              </div>
            ) : (
              <div className="activity-feed">
                {activity.map(item => (
                  <div key={item.id} className="activity-item">
                    <div className="activity-item__icon">
                      {ACTION_ICONS[item.action] || '⚡'}
                    </div>
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

      {/* ── Quick actions ────────────────────────────────── */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3 className="dashboard-section-title">Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/admin/parts"          className="btn btn-ghost btn-sm">🔧 Manage Parts</Link>
          <Link to="/admin/gallery"         className="btn btn-ghost btn-sm">🖼️ Manage Gallery</Link>
          <Link to="/admin/messages"        className="btn btn-ghost btn-sm">
            ✉️ Messages
            {stats?.unread_messages > 0 && (
              <span className="msg-unread-badge" style={{ fontSize: 10, marginLeft: 4 }}>
                {stats.unread_messages}
              </span>
            )}
          </Link>
          <Link to="/admin/business-info"  className="btn btn-ghost btn-sm">🏢 Business Info</Link>
        </div>
      </div>
    </div>
  );
};

/* ── Stat card component ───────────────────────────────── */
const StatCard = ({ icon, label, value, sub, color, to, highlight }) => (
  <Link to={to} className={`dashboard-stat-card${highlight ? ' dashboard-stat-card--highlight' : ''}`}>
    <div className="dashboard-stat-card__icon" style={{ background: `${color}18`, color }}>
      {icon}
    </div>
    <div className="dashboard-stat-card__content">
      <p className="dashboard-stat-card__label">{label}</p>
      <p className="dashboard-stat-card__value" style={{ color }}>{value}</p>
      <p className="dashboard-stat-card__sub">{sub}</p>
    </div>
  </Link>
);

export default DashboardPage;
