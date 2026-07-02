/**
 * api/authApi.js
 * Authentication API calls.
 */
import api from './axios';

export const loginApi = (credentials) =>
  api.post('/auth/login', credentials);

export const getMeApi = () =>
  api.get('/auth/me');
