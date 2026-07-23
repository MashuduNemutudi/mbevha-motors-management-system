import api from './axios';

export const getJobCardsApi  = (params = {}) => api.get('/job-cards', { params });
export const getJobCardApi   = (id)           => api.get(`/job-cards/${id}`);
export const createJobCardApi = (data)        => api.post('/job-cards', data);
export const updateJobCardApi = (id, data)    => api.put(`/job-cards/${id}`, data);
export const deleteJobCardApi = (id)          => api.delete(`/job-cards/${id}`);
export const getJobCardPdfApi = (id)          =>
  api.get(`/job-cards/${id}/pdf`, { responseType: 'blob' });
