/**
 * components/admin/Sidebar.jsx
 * ─────────────────────────────────────────────────────────────
 * Admin dashboard sidebar navigation.
 *
 * Features (Phase 2):
 *   - Mbevha Motors branding at top
 *   - Navigation links with icons:
 *     Dashboard, Quotations, Invoices, Parts,
 *     Gallery, Messages (with unread badge),
 *     Business Info, Settings
 *   - Active link highlight
 *   - Logout button at bottom
 *   - Collapsible on mobile
 *
 * TODO (Phase 2): Add icons, unread badge, mobile collapse.
 */

import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/admin/dashboard',      label: 'Dashboard'         },
  { to: '/admin/quotations',     label: 'Quotations'        },
  { to: '/admin/invoices',       label: 'Invoices'          },
  { to: '/admin/parts',          label: 'Parts'             },
  { to: '/admin/gallery',        label: 'Gallery'           },
  { to: '/admin/messages',       label: 'Messages'          },
  { to: '/admin/business-info',  label: 'Business Info'     },
  { to: '/admin/settings',       label: 'Settings'          },
];

const Sidebar = () => {
  const { admin, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-name">Mbevha Motors</span>
        <span className="sidebar__brand-sub">Management System</span>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <span className="sidebar__admin-name">{admin?.username}</span>
        <button className="sidebar__logout btn btn-outline" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
