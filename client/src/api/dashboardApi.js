/**
 * api/dashboardApi.js
 * Dashboard data API calls (all admin-only, JWT auto-attached).
 */
import api from './axios';

export const getDashboardStatsApi    = () => api.get('/dashboard/stats');
export const getDashboardActivityApi = (limit = 15) =>
  api.get('/dashboard/activity', { params: { limit } });
export const getDashboardChartsApi   = () => api.get('/dashboard/charts');
