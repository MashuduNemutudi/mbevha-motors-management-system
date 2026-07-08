/**
 * pages/admin/GalleryAdminPage.jsx
 * Complete Gallery Management — Upload, Edit Caption, Delete.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getGalleryApi, uploadImageApi, updateCaptionApi, deleteImageApi,
} from '../../api/galleryApi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal         from '../../components/common/Modal';
import Spinner       from '../../components/common/Spinner';

const UPLOADS_BASE = import.meta.env.VITE_API_URL || '';

const GalleryAdminPage = () => {
  const [images, setImages]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Upload
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Edit caption
  const [editTarget, setEditTarget] = useState(null);
  const [editCaption, setEditCaption] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]     = useState(false);

  /* ── Load ───────────────────────────────────────────────── */
  const load = useCallback(async () => {
    try {
      const res = await getGalleryApi();
      setImages(res.data.data || []);
    } catch {
      setError('Failed to load gallery.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Upload ─────────────────────────────────────────────── */
  const openUpload = () => {
    setUploadFile(null);
    setUploadCaption('');
    setUploadPreview(null);
    setUploadError('');
    setUploadModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return setUploadError('Please select an image file.');
    setUploading(true);
    setUploadError('');
    try {
      const fd = new FormData();
      fd.append('image', uploadFile);
      if (uploadCaption.trim()) fd.append('caption', uploadCaption.trim());
      await uploadImageApi(fd);
      await load();
      setUploadModal(false);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  /* ── Edit caption ───────────────────────────────────────── */
  const openEdit = (img) => {
    setEditTarget(img);
    setEditCaption(img.caption || '');
  };

  const saveCaption = async () => {
    if (!editTarget) return;
    setEditSaving(true);
    try {
      await updateCaptionApi(editTarget.id, { caption: editCaption });
      setImages(imgs => imgs.map(i =>
        i.id === editTarget.id ? { ...i, caption: editCaption } : i
      ));
      setEditTarget(null);
    } catch {
      setError('Failed to update caption.');
    } finally {
      setEditSaving(false);
    }
  };

  /* ── Delete ─────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteImageApi(deleteTarget.id);
      setImages(imgs => imgs.filter(i => i.id !== deleteTarget.id));
    } catch {
      setError('Failed to delete image.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Gallery Management</h1>
          <p className="page-subtitle">{images.length} image{images.length !== 1 ? 's' : ''} uploaded</p>
        </div>
        <button className="btn btn-primary" onClick={openUpload}>+ Upload Image</button>
      </div>

      {error && <div className="alert alert--danger" style={{ marginBottom: 20 }}>{error}</div>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size="large" /></div>
      ) : images.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
          <p>No images uploaded yet. <button className="btn btn-primary btn-sm" onClick={openUpload} style={{ marginLeft: 8 }}>Upload the first image</button></p>
        </div>
      ) : (
        <div className="gallery-admin-grid">
          {images.map(img => (
            <div key={img.id} className="gallery-admin-card">
              <div className="gallery-admin-card__img-wrap">
                <img
                  src={`${UPLOADS_BASE}/uploads/gallery/${img.image_url}`}
                  alt={img.caption || 'Gallery image'}
                  loading="lazy"
                />
              </div>
              <div className="gallery-admin-card__body">
                {editTarget?.id === img.id ? (
                  <div className="gallery-admin-card__edit">
                    <input
                      type="text" value={editCaption}
                      onChange={e => setEditCaption(e.target.value)}
                      placeholder="Enter caption…"
                      maxLength={255}
                      onKeyDown={e => { if (e.key === 'Enter') saveCaption(); if (e.key === 'Escape') setEditTarget(null); }}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button className="btn btn-primary btn-sm" onClick={saveCaption} disabled={editSaving}>
                        {editSaving ? 'Saving…' : 'Save'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditTarget(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="gallery-admin-card__caption"
                       onClick={() => openEdit(img)}
                       title="Click to edit caption">
                      {img.caption || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No caption — click to add</span>}
                    </p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(img)}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(img)}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Upload Modal ─────────────────────────────────── */}
      <Modal isOpen={uploadModal} onClose={() => setUploadModal(false)} title="Upload Gallery Image" size="sm">
        <form onSubmit={handleUpload}>
          {uploadError && <div className="alert alert--danger" style={{ marginBottom: 12 }}>{uploadError}</div>}
          <div className="form-group">
            <label>Image File *</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
            {uploadPreview && (
              <img src={uploadPreview} alt="Preview"
                style={{ marginTop: 10, width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }} />
            )}
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>JPEG, PNG or WebP — max 5 MB</span>
          </div>
          <div className="form-group">
            <label htmlFor="caption">Caption (optional)</label>
            <input id="caption" type="text" value={uploadCaption}
              onChange={e => setUploadCaption(e.target.value)}
              placeholder="e.g. Workshop interior" maxLength={255} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setUploadModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? <><Spinner size="small" color="white" /> Uploading…</> : 'Upload Image'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm ───────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Image"
        message="Are you sure you want to delete this image? This cannot be undone."
      />
    </div>
  );
};

export default GalleryAdminPage;
