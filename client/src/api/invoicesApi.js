import api from './axios';

export const getInvoicesApi      = (params = {}) => api.get('/invoices', { params });
export const getInvoiceApi       = (id)          => api.get(`/invoices/${id}`);
export const createInvoiceApi    = (data)        => api.post('/invoices', data);
export const updateInvoiceApi    = (id, data)    => api.put(`/invoices/${id}`, data);
export const deleteInvoiceApi    = (id)          => api.delete(`/invoices/${id}`);
export const updatePaymentApi    = (id, data)    => api.patch(`/invoices/${id}/payment`, data);
export const getInvoicePdfUrl    = (id)          => `${import.meta.env.VITE_API_URL || ''}/api/invoices/${id}/pdf`;
