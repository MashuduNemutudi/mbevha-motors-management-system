/**
 * api/businessApi.js
 * Business information API calls.
 *
 * getBusinessInfo()    — GET /api/business  (public, no auth needed)
 * updateBusinessInfo() — PUT /api/business  (admin, JWT auto-attached by axios interceptor)
 */

import api from './axios';

export const getBusinessInfo    = ()     => api.get('/business');
export const updateBusinessInfo = (data) => api.put('/business', data);
