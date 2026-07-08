/**
 * api/galleryApi.js
 * Gallery API calls. JWT auto-attached by axios interceptor on admin calls.
 */
import api from './axios';

// Public
export const getGalleryApi     = ()            => api.get('/gallery');

// Admin (JWT required)
export const uploadImageApi    = (formData)    => api.post('/gallery', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateCaptionApi  = (id, data)   => api.patch(`/gallery/${id}`, data);
export const deleteImageApi    = (id)          => api.delete(`/gallery/${id}`);
