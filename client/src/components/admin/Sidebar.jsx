/**
 * components/admin/Sidebar.jsx
 * Admin sidebar navigation with unread messages badge,
 * "Visit Website" link, and logout button.
 */

import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getMessageStatsApi } from '../../api/messagesApi';

const Sidebar = () => {
  const { admin, logout } = useAuth();
  const [unread, setUnread] = useState(0);

  /* Poll for unread message count every 60 s */
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await getMessageStatsApi();
        setUnread(res.data?.data?.unread || 0);
      } catch { /* non-fatal */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, []);

  const NAV_ITEMS = [
    { to: '/admin/dashboard',     label: '📊  Dashboard'     },
    { to: '/admin/quotations',    label: '📄  Quotations'    },
    { to: '/admin/invoices',      label: '🧾  Invoices'      },
    { to: '/admin/parts',         label: '🔧  Parts'         },
    { to: '/admin/gallery',       label: '🖼️   Gallery'       },
    { to: '/admin/job-cards',     label: '🔖  Job Cards'    },
    { to: '/admin/messages',      label: '✉️   Messages', badge: unread },
    { to: '/admin/business-info', label: '🏢  Business Info' },
    { to: '/admin/settings',      label: '⚙️   Settings'      },
  ];

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <span className="sidebar__brand-name">Mbevha Motors</span>
        <span className="sidebar__brand-sub">Management System</span>
      </div>

      {/* Main navigation */}
      <nav className="sidebar__nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
          >
            <span>{item.label}</span>
            {item.badge > 0 && (
              <span className="sidebar__badge">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer: website link + user info + logout */}
      <div className="sidebar__footer">

        {/* Back to public website */}
        <Link to="/" className="sidebar__website-link">
          🌐 &nbsp;Visit Website
        </Link>

        <div className="sidebar__footer-divider" />

        <span className="sidebar__admin-name">
          👤 &nbsp;{admin?.username}
        </span>

        <button className="sidebar__logout" onClick={logout}>
          🚪 &nbsp;Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
