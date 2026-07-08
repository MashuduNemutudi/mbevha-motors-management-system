/**
 * api/partsApi.js
 * Parts API calls. JWT auto-attached by axios interceptor on admin calls.
 */
import api from './axios';

// Public
export const getPartsApi    = (params = {}) => api.get('/parts', { params });
export const getPartApi     = (id)          => api.get(`/parts/${id}`);

// Admin (JWT required)
export const createPartApi  = (formData)    => api.post('/parts', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updatePartApi  = (id, formData) => api.put(`/parts/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const togglePartAvailabilityApi = (id) => api.patch(`/parts/${id}/availability`);
export const deletePartApi  = (id)          => api.delete(`/parts/${id}`);
