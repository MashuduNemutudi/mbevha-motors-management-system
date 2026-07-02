/**
 * components/admin/AdminLayout.jsx
 * ─────────────────────────────────────────────────────────────
 * Wrapper layout for all admin dashboard pages.
 * Renders Sidebar + main content area side by side.
 *
 * Used in App.jsx to wrap all /admin/* routes.
 * ─────────────────────────────────────────────────────────────
 */

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
