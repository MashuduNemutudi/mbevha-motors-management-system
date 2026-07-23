import api from './axios';

export const getInvoicesApi    = (params = {}) => api.get('/invoices', { params });
export const getInvoiceApi     = (id)           => api.get(`/invoices/${id}`);
export const createInvoiceApi  = (data)         => api.post('/invoices', data);
export const updateInvoiceApi  = (id, data)     => api.put(`/invoices/${id}`, data);
export const deleteInvoiceApi  = (id)           => api.delete(`/invoices/${id}`);
export const updatePaymentApi  = (id, data)     => api.patch(`/invoices/${id}/payment`, data);
export const getInvoicePdfApi  = (id)           => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
