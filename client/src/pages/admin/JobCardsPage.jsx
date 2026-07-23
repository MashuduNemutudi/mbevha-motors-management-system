import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getJobCardsApi, deleteJobCardApi, getJobCardPdfApi } from '../../api/jobCardsApi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner       from '../../components/common/Spinner';
import { formatDate } from '../../utils/formatDate';

const STATUS_BADGE = {
  open:        'badge--orange',
  in_progress: 'badge--grey',
  completed:   'badge--green',
  cancelled:   'badge--red',
};
const STATUS_LABEL = {
  open: 'Open', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled',
};

const JobCardsPage = () => {
  const [cards, setCards]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('all');
  const [deleteTarget, setDelete]   = useState(null);
  const [pdfLoading, setPdfLoading] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await getJobCardsApi({ search: search.trim(), status: statusFilter });
      setCards(res.data.data || []);
    } catch { setError('Failed to load job cards.'); }
    finally   { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handlePdf = async (id, number) => {
    setPdfLoading(id);
    try {
      const res  = await getJobCardPdfApi(id);
      const url  = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a    = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { setError('Failed to generate PDF.'); }
    finally  { setPdfLoading(null); }
  };

  const handleDelete = async () => {
    try {
      await deleteJobCardApi(deleteTarget.id);
      setCards(c => c.filter(x => x.id !== deleteTarget.id));
    } catch { setError('Failed to delete job card.'); }
    finally  { setDelete(null); }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="page-title">Job Cards</h1>
          <p className="page-subtitle">{cards.length} job card{cards.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/admin/job-cards/new" className="btn btn-primary">+ New Job Card</Link>
      </div>

      {error && <div className="alert alert--danger" style={{ marginBottom:16 }}>{error}</div>}

      {/* Filters */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <input type="text" placeholder="Search by owner, vehicle, registration…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width:'100%', padding:'9px 14px', border:'1.5px solid var(--border-color)', borderRadius:6, fontSize:13 }} />
          {search && <button onClick={() => setSearch('')}
            style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16, color:'var(--text-muted)' }}>✕</button>}
        </div>
        {['all','open','in_progress','completed','cancelled'].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}>
            {s === 'all' ? 'All' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size="large" /></div>
      ) : cards.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🔧</div>
          <p>No job cards found.</p>
          <Link to="/admin/job-cards/new" className="btn btn-primary" style={{ marginTop:16 }}>
            Create First Job Card
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <table className="admin-table">
            <thead><tr>
              <th>Number</th><th>Date</th><th>Owner</th><th>Contact</th>
              <th>Vehicle</th><th>Reg No.</th><th>Technician</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {cards.map(c => (
                <tr key={c.id}>
                  <td><strong style={{ color:'var(--color-primary)' }}>{c.job_card_number}</strong></td>
                  <td style={{ whiteSpace:'nowrap' }}>{formatDate(c.job_date || c.created_at)}</td>
                  <td>{c.owner_name}</td>
                  <td>{c.contact_number}</td>
                  <td>{c.vehicle_make || '—'}</td>
                  <td>{c.registration_number || '—'}</td>
                  <td>{c.technician_name || '—'}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[c.status] || 'badge--grey'}`}>
                      {STATUS_LABEL[c.status] || c.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      <Link to={`/admin/job-cards/${c.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handlePdf(c.id, c.job_card_number)}
                        disabled={pdfLoading === c.id}
                      >
                        {pdfLoading === c.id ? '…' : '🖨️ PDF'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDelete(c)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={handleDelete}
        title="Delete Job Card"
        message={`Delete job card ${deleteTarget?.job_card_number} for ${deleteTarget?.owner_name}? This cannot be undone.`}
      />
    </div>
  );
};

export default JobCardsPage;
