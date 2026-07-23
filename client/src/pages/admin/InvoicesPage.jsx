import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getInvoicesApi, deleteInvoiceApi, updatePaymentApi, getInvoicePdfApi } from '../../api/invoicesApi';
import ConfirmDialog  from '../../components/common/ConfirmDialog';
import Spinner        from '../../components/common/Spinner';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

const PAY_COLORS = { pending: 'badge--orange', partial: 'badge--grey', paid: 'badge--green' };

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch]     = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [payTarget, setPayTarget]       = useState(null);
  const [payForm, setPayForm]   = useState({ payment_status: 'paid', payment_method: 'cash', reference_number: '' });

  const load = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim())          params.search  = search.trim();
      const res = await getInvoicesApi(params);
      setInvoices(res.data.data || []);
    } catch { setError('Failed to load invoices.'); }
    finally  { setLoading(false); }
  }, [statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    try { await deleteInvoiceApi(deleteTarget.id); setInvoices(is => is.filter(i => i.id !== deleteTarget.id)); }
    catch { setError('Failed to delete.'); }
    finally { setDeleteTarget(null); }
  };

  const handleUpdatePayment = async () => {
    try {
      await updatePaymentApi(payTarget.id, payForm);
      setInvoices(is => is.map(i => i.id === payTarget.id ? { ...i, ...payForm } : i));
    } catch { setError('Failed to update payment.'); }
    finally { setPayTarget(null); }
  };

  const [pdfLoading, setPdfLoading] = useState(null);

  const openPdf = async (id) => {
    setPdfLoading(id);
    try {
      const res    = await getInvoicePdfApi(id);
      const blobUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = blobUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch {
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/admin/invoices/new" className="btn btn-primary">+ New Invoice</Link>
      </div>

      {error && <div className="alert alert--danger" style={{ marginBottom: 16 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <input type="text" placeholder="Search customer, phone, number…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', border: '1.5px solid var(--border-color)', borderRadius: 6, fontSize: 13 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {['all','pending','partial','paid'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
              style={{ textTransform: 'capitalize' }}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size="large" /></div>
      ) : invoices.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
          <p>No invoices found. <Link to="/admin/invoices/new" className="btn btn-primary btn-sm" style={{ marginLeft: 8 }}>Create one</Link></p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td><strong style={{ fontSize: 13 }}>{inv.invoice_number}</strong>
                    {inv.quotation_id && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>from quotation</div>}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{inv.customer_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inv.phone}</div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {inv.vehicle || [inv.vehicle_make, inv.vehicle_model].filter(Boolean).join(' ') || '—'}
                    {inv.registration_number && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inv.registration_number}</div>}
                  </td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(inv.total_amount)}</td>
                  <td>
                    <span className={`badge ${PAY_COLORS[inv.payment_status] || 'badge--grey'}`} style={{ textTransform: 'capitalize' }}>
                      {inv.payment_status}
                    </span>
                    {inv.payment_method && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{inv.payment_method.toUpperCase()}</div>}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(inv.invoice_date || inv.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openPdf(inv.id)} disabled={pdfLoading === inv.id}>{pdfLoading === inv.id ? '…' : '📄 PDF'}</button>
                      <Link to={`/admin/invoices/${inv.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                      {inv.payment_status !== 'paid' && (
                        <button className="btn btn-sm" style={{ background: '#27ae60', color: '#fff', border: 'none' }}
                          onClick={() => { setPayTarget(inv); setPayForm({ payment_status: 'paid', payment_method: inv.payment_method || 'cash', reference_number: inv.reference_number || '' }); }}>
                          Mark Paid
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(inv)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment modal */}
      {payTarget && (
        <div className="modal-overlay" onClick={() => setPayTarget(null)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Update Payment</h2>
              <button className="modal__close" onClick={() => setPayTarget(null)}>✕</button>
            </div>
            <div className="modal__body">
              <p style={{ marginBottom: 16, fontSize: 13 }}>{payTarget.invoice_number} — {payTarget.customer_name}</p>
              <div className="form-group">
                <label>Payment Status</label>
                <select value={payForm.payment_status} onChange={e => setPayForm(f => ({ ...f, payment_status: e.target.value }))}>
                  <option value="pending">Pending</option>
                  <option value="partial">Partially Paid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select value={payForm.payment_method} onChange={e => setPayForm(f => ({ ...f, payment_method: e.target.value }))}>
                  <option value="cash">Cash</option>
                  <option value="eft">EFT</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div className="form-group">
                <label>Reference Number</label>
                <input value={payForm.reference_number} onChange={e => setPayForm(f => ({ ...f, reference_number: e.target.value }))} placeholder="Optional" />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setPayTarget(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleUpdatePayment}>Update</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} title="Delete Invoice"
        message={`Delete invoice ${deleteTarget?.invoice_number}? This cannot be undone.`} />
    </div>
  );
};

export default InvoicesPage;
