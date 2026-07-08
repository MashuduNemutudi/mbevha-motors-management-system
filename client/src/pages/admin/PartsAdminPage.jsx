/**
 * pages/admin/PartsAdminPage.jsx
 * Complete Parts Management CRUD — Add, Edit, Delete, Toggle availability, Image upload.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getPartsApi, createPartApi, updatePartApi,
  togglePartAvailabilityApi, deletePartApi,
} from '../../api/partsApi';
import Modal         from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner       from '../../components/common/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';

const CATEGORIES = [
  'Engine', 'Gearbox', 'Body Parts', 'Electrical', 'Suspension',
  'Brakes', 'Steering', 'Drivetrain', 'Cooling', 'Exhaust',
  'Interior', 'Tyres & Wheels', 'Fuel System', 'Other',
];

const EMPTY_FORM = {
  name: '', category: '', description: '',
  price: '', quantity: '0', is_available: true,
};

const UPLOADS_BASE = import.meta.env.VITE_API_URL || '';

const PartsAdminPage = () => {
  const [parts, setParts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Modal state
  const [modalOpen, setModalOpen]   = useState(false);
  const [editPart, setEditPart]     = useState(null); // null = create mode
  const [form, setForm]             = useState(EMPTY_FORM);
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]     = useState(false);

  // Filter
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSearch, setFilterSearch]     = useState('');
  const [filterAvail, setFilterAvail]       = useState('all');

  /* ── Load parts ─────────────────────────────────────────── */
  const load = useCallback(async () => {
    try {
      const res = await getPartsApi();
      setParts(res.data.data || []);
    } catch {
      setError('Failed to load parts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Filtered view ──────────────────────────────────────── */
  const filtered = parts.filter(p => {
    const matchCat    = filterCategory === 'All' || p.category === filterCategory;
    const matchSearch = p.name.toLowerCase().includes(filterSearch.toLowerCase());
    const matchAvail  = filterAvail === 'all' || (filterAvail === 'available' ? p.is_available : !p.is_available);
    return matchCat && matchSearch && matchAvail;
  });

  /* ── Open modal ─────────────────────────────────────────── */
  const openCreate = () => {
    setEditPart(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (part) => {
    setEditPart(part);
    setForm({
      name:         part.name,
      category:     part.category,
      description:  part.description || '',
      price:        String(part.price),
      quantity:     String(part.quantity),
      is_available: part.is_available,
    });
    setImageFile(null);
    setImagePreview(part.image_url ? `${UPLOADS_BASE}/uploads/parts/${part.image_url}` : null);
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setFormError(''); };

  /* ── Form change ────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  /* ── Submit form ────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) return setFormError('Part name is required.');
    if (!form.category)    return setFormError('Category is required.');
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      return setFormError('Please enter a valid price (0 or more).');

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name',         form.name.trim());
      fd.append('category',     form.category);
      fd.append('description',  form.description.trim());
      fd.append('price',        Number(form.price));
      fd.append('quantity',     parseInt(form.quantity) || 0);
      fd.append('is_available', form.is_available);
      if (imageFile) fd.append('image', imageFile);

      if (editPart) {
        await updatePartApi(editPart.id, fd);
      } else {
        await createPartApi(fd);
      }

      await load();
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save part.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Toggle availability ────────────────────────────────── */
  const handleToggle = async (part) => {
    try {
      await togglePartAvailabilityApi(part.id);
      setParts(ps => ps.map(p =>
        p.id === part.id ? { ...p, is_available: !p.is_available } : p
      ));
    } catch {
      setError('Failed to update availability.');
    }
  };

  /* ── Delete ─────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePartApi(deleteTarget.id);
      setParts(ps => ps.filter(p => p.id !== deleteTarget.id));
    } catch {
      setError('Failed to delete part.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  /* ── Render ─────────────────────────────────────────────── */
  const existingCategories = ['All', ...Array.from(new Set(parts.map(p => p.category))).sort()];

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Parts Management</h1>
          <p className="page-subtitle">{parts.length} part{parts.length !== 1 ? 's' : ''} in inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Part</button>
      </div>

      {error && <div className="alert alert--danger" style={{ marginBottom: 20 }}>{error}</div>}

      {/* ── Filters ──────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <input
          type="text" placeholder="Search parts…" value={filterSearch}
          onChange={e => setFilterSearch(e.target.value)}
          style={{ padding: '8px 14px', border: '1.5px solid var(--border-color)', borderRadius: 6, fontSize: 13, minWidth: 200, flex: 1 }}
        />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          style={{ padding: '8px 14px', border: '1.5px solid var(--border-color)', borderRadius: 6, fontSize: 13 }}>
          {existingCategories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterAvail} onChange={e => setFilterAvail(e.target.value)}
          style={{ padding: '8px 14px', border: '1.5px solid var(--border-color)', borderRadius: 6, fontSize: 13 }}>
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      {/* ── Table ────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size="large" /></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
          <p>No parts found. <button className="btn btn-primary btn-sm" onClick={openCreate} style={{ marginLeft: 8 }}>Add the first part</button></p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 52 }}></th>
                <th>Part Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(part => (
                <tr key={part.id}>
                  <td>
                    {part.image_url ? (
                      <img src={`${UPLOADS_BASE}/uploads/parts/${part.image_url}`}
                        alt={part.name}
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, display: 'block' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--color-grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔧</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{part.name}</div>
                    {part.description && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{part.description.slice(0, 60)}{part.description.length > 60 ? '…' : ''}</div>}
                  </td>
                  <td><span className="badge badge--grey">{part.category}</span></td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(part.price)}</td>
                  <td>{part.quantity}</td>
                  <td>
                    <button
                      onClick={() => handleToggle(part)}
                      className={`badge ${part.is_available ? 'badge--green' : 'badge--red'}`}
                      style={{ cursor: 'pointer', border: 'none', padding: '4px 12px' }}
                      title="Click to toggle"
                    >
                      {part.is_available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(part)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(part)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add/Edit Modal ───────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editPart ? 'Edit Part' : 'Add New Part'} size="md">
        <form onSubmit={handleSubmit}>
          {formError && <div className="alert alert--danger" style={{ marginBottom: 16 }}>{formError}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="name">Part Name *</label>
              <input id="name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="e.g. BMW E46 Front Strut" required />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select id="category" name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select category…</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="price">Price (ZAR) *</label>
              <input id="price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" required />
            </div>
            <div className="form-group">
              <label htmlFor="quantity">Quantity in Stock</label>
              <input id="quantity" name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} placeholder="0" />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                <input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange} style={{ width: 16, height: 16, accentColor: 'var(--clr-red)' }} />
                Mark as Available
              </label>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Condition, fitment, notes…" rows={3} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Part Image</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} style={{ fontSize: 13 }} />
              {imagePreview && (
                <div style={{ marginTop: 10 }}>
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8 }} />
                </div>
              )}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>JPEG, PNG or WebP — max 5 MB</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><Spinner size="small" color="white" /> Saving…</> : (editPart ? 'Save Changes' : 'Add Part')}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm ───────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Part"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  );
};

export default PartsAdminPage;
