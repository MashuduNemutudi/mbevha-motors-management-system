import api from './axios';

export const loginApi          = (credentials) => api.post('/auth/login', credentials);
export const getMeApi          = ()             => api.get('/auth/me');
export const changePasswordApi = (data)         => api.put('/auth/change-password', data);
