/**
 * api/messagesApi.js
 * Contact Messages API calls.
 *
 * submitMessageApi  — POST /api/messages  (public, no auth)
 * getMessagesApi    — GET  /api/messages  (admin)
 * getMessageStatsApi— GET  /api/messages/stats (admin, dashboard badge)
 * markReadApi       — PATCH /api/messages/:id/read (admin)
 * deleteMessageApi  — DELETE /api/messages/:id (admin)
 */
import api from './axios';

export const submitMessageApi    = (data)  => api.post('/messages', data);
export const getMessagesApi      = (params = {}) => api.get('/messages', { params });
export const getMessageStatsApi  = ()      => api.get('/messages/stats');
export const markReadApi         = (id)    => api.patch(`/messages/${id}/read`);
export const deleteMessageApi    = (id)    => api.delete(`/messages/${id}`);
