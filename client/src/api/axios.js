/**
 * api/axios.js
 * ─────────────────────────────────────────────────────────────
 * Configured Axios instance used by all API calls in the app.
 *
 * What this does:
 *   - Sets the base URL from the environment variable
 *     (or falls back to /api which the Vite proxy handles in dev)
 *   - Attaches the JWT Authorization header automatically on
 *     every request if a token exists in localStorage
 *   - Intercepts 401 responses and redirects to /admin/login
 *     so the admin is prompted to re-authenticate when their
 *     session expires
 * ─────────────────────────────────────────────────────────────
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// ── Request interceptor ───────────────────────────────────────
// Automatically attach JWT to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mmms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────
// Handle 401 globally — session expired or invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored credentials
      localStorage.removeItem('mmms_token');
      localStorage.removeItem('mmms_admin');
      // Redirect to login unless already there
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
