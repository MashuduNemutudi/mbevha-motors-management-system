/**
 * pages/admin/LoginPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Administrator login page.
 *
 * Features (Phase 2 — Authentication):
 *   - Centred login card with Mbevha Motors branding
 *   - Username and password fields
 *   - Show / hide password toggle
 *   - Loading state on submit
 *   - Error message display (invalid credentials)
 *   - Calls AuthContext.login() on submit
 *   - Redirects to /admin/dashboard on success
 *   - Redirects to /admin/dashboard if already logged in
 *
 * Auth: POST /api/auth/login
 * ─────────────────────────────────────────────────────────────
 * TODO (Phase 2): Implement the full login form UI.
 */

import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const { admin, login, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in — redirect
  if (!loading && admin) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ username, password });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <h1>Mbevha Motors</h1>
          <p>Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>Administrator Login</h2>

          {error && <div className="alert alert--danger">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
