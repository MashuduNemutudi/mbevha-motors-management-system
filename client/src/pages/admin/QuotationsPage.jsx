import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getQuotationsApi, deleteQuotationApi, duplicateQuotationApi,
  updateStatusApi, convertToInvoiceApi, getQuotationPdfUrl,
} from '../../api/quotationsApi';
import ConfirmDialog  from '../../components/common/ConfirmDialog';
import Spinner        from '../../components/common/Spinner';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import useAuth from '../../hooks/useAuth';

const STATUS_COLORS = {
  draft:     'badge--grey',
  sent:      'badge--orange',
  approved:  'badge--green',
  rejected:  'badge--red',
  converted: 'badge--green',
};

const QuotationsPage = () => {
  const navigate  = useNavigate();
  const { token } = useAuth();

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch]         = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [working, setWorking]       = useState(null); // id of row being acted on

  const load = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim())          params.search  = search.trim();
      const res = await getQuotationsApi(params);
      setQuotations(res.data.data || []);
    } catch { setError('Failed to load quotations.'); }
    finally  { setLoading(false); }
  }, [statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteQuotationApi(deleteTarget.id);
      setQuotations(qs => qs.filter(q => q.id !== deleteTarget.id));
    } catch { setError('Failed to delete.'); }
    finally { setDeleteTarget(null); }
  };

  const handleDuplicate = async (q) => {
    setWorking(q.id);
    try {
      await duplicateQuotationApi(q.id);
      await load();
    } catch { setError('Failed to duplicate.'); }
    finally { setWorking(null); }
  };

  const handleConvert = async (q) => {
    if (!window.confirm(`Convert ${q.quotation_number} to an Invoice?`)) return;
    setWorking(q.id);
    try {
      const res = await convertToInvoiceApi(q.id);
      await load();
      navigate(`/admin/invoices/${res.data.data.id}/edit`);
    } catch (err) {
      setError(err.response?.data?.message || 'Conversion failed.');
    } finally { setWorking(null); }
  };

  const openPdf = (id) => {
    const url = getQuotationPdfUrl(id);
    const token = localStorage.getItem('mmms_token');
    // Open PDF with auth header via fetch + blob URL
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => window.open(URL.createObjectURL(blob), '_blank'));
  };

  const STATUSES = ['all','draft','sent','approved','rejected','converted'];

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Quotations</h1>
          <p className="page-subtitle">{quotations.length} quotation{quotations.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/admin/quotations/new" className="btn btn-primary">+ New Quotation</Link>
      </div>

      {error && <div className="alert alert--danger" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <input type="text" placeholder="Search customer, phone, number…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', border: '1.5px solid var(--border-color)', borderRadius: 6, fontSize: 13 }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
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
      ) : quotations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
          <p>No quotations found. <Link to="/admin/quotations/new" className="btn btn-primary btn-sm" style={{ marginLeft: 8 }}>Create one</Link></p>
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
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map(q => (
                <tr key={q.id} style={{ opacity: working === q.id ? 0.5 : 1 }}>
                  <td><strong style={{ fontSize: 13 }}>{q.quotation_number}</strong></td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{q.customer_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.phone}</div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {[q.vehicle_make, q.vehicle_model].filter(Boolean).join(' ') || '—'}
                    {q.registration_number && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.registration_number}</div>}
                  </td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(q.total_amount)}</td>
                  <td>
                    <span className={`badge ${STATUS_COLORS[q.status] || 'badge--grey'}`} style={{ textTransform: 'capitalize' }}>
                      {q.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(q.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openPdf(q.id)} title="View PDF">📄 PDF</button>
                      <Link to={`/admin/quotations/${q.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDuplicate(q)} title="Duplicate">Copy</button>
                      {q.status === 'approved' && (
                        <button className="btn btn-sm" style={{ background: '#27ae60', color: '#fff', border: 'none' }}
                          onClick={() => handleConvert(q)}>→ Invoice</button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(q)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} title="Delete Quotation"
        message={`Delete quotation ${deleteTarget?.quotation_number}? This cannot be undone.`} />
    </div>
  );
};

export default QuotationsPage;
