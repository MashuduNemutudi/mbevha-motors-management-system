/**
 * components/common/ProtectedRoute.jsx
 * ─────────────────────────────────────────────────────────────
 * Wraps admin dashboard routes. If the admin is not logged in,
 * redirects to /admin/login while preserving the intended URL
 * so the admin can be sent back after a successful login.
 *
 * While the auth context is still checking the stored session
 * (loading === true), a full-screen spinner is shown to prevent
 * a flash of the login page on page refresh.
 *
 * Usage in App.jsx:
 *   <Route path="/admin/dashboard" element={
 *     <ProtectedRoute><DashboardPage /></ProtectedRoute>
 *   } />
 * ─────────────────────────────────────────────────────────────
 */

import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Spinner from './Spinner';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="protected-route-loading">
        <Spinner size="large" />
      </div>
    );
  }

  if (!admin) {
    // Redirect to login, preserving where the admin was trying to go
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
