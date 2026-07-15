import api from './axios';

export const getQuotationsApi     = (params = {})      => api.get('/quotations', { params });
export const getQuotationApi      = (id)               => api.get(`/quotations/${id}`);
export const createQuotationApi   = (data)             => api.post('/quotations', data);
export const updateQuotationApi   = (id, data)         => api.put(`/quotations/${id}`, data);
export const deleteQuotationApi   = (id)               => api.delete(`/quotations/${id}`);
export const duplicateQuotationApi= (id)               => api.post(`/quotations/${id}/duplicate`);
export const updateStatusApi      = (id, status)       => api.patch(`/quotations/${id}/status`, { status });
export const convertToInvoiceApi  = (id)               => api.post(`/quotations/${id}/convert`);
export const getQuotationPdfUrl   = (id)               => `${import.meta.env.VITE_API_URL || ''}/api/quotations/${id}/pdf`;
