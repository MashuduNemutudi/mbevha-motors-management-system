/**
 * context/AuthContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Authentication context for the admin dashboard.
 *
 * Provides:
 *   admin   — current admin object (id, username) or null
 *   token   — JWT string or null
 *   loading — true while checking stored session on mount
 *   login   — function(credentials) → logs admin in, stores token
 *   logout  — function() → clears session, redirects to login
 *
 * Storage:
 *   Token and admin data are stored in localStorage so the
 *   session survives page refreshes within the JWT's expiry window.
 *
 * Usage:
 *   const { admin, login, logout } = useAuth();
 * ─────────────────────────────────────────────────────────────
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi, getMeApi } from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin]     = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ── Restore session on mount ────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('mmms_token');
      const storedAdmin = localStorage.getItem('mmms_admin');

      if (storedToken && storedAdmin) {
        try {
          // Verify the token is still valid against the server
          const res = await getMeApi();
          setToken(storedToken);
          setAdmin(res.data.admin);
        } catch {
          // Token expired or invalid — clear storage silently
          localStorage.removeItem('mmms_token');
          localStorage.removeItem('mmms_admin');
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  // ── Login ──────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const res = await loginApi(credentials);
    const { token: newToken, admin: adminData } = res.data;

    localStorage.setItem('mmms_token', newToken);
    localStorage.setItem('mmms_admin', JSON.stringify(adminData));

    setToken(newToken);
    setAdmin(adminData);

    navigate('/admin/dashboard');
  }, [navigate]);

  // ── Logout ─────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('mmms_token');
    localStorage.removeItem('mmms_admin');
    setToken(null);
    setAdmin(null);
    navigate('/admin/login');
  }, [navigate]);

  const value = { admin, token, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
