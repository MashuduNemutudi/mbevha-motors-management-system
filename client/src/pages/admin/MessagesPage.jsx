import { useState, useEffect, useCallback } from 'react';
import {
  getMessagesApi, markReadApi, deleteMessageApi,
} from '../../api/messagesApi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner       from '../../components/common/Spinner';
import { formatDateTime } from '../../utils/formatDate';

const MessagesPage = () => {
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [filter, setFilter]       = useState('all');   // all | unread
  const [search, setSearch]       = useState('');

  const [selected, setSelected]   = useState(null);    // expanded message
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]   = useState(false);

  /* ── Load messages ─────────────────────────────────────── */
  const load = useCallback(async () => {
    try {
      const params = {};
      if (filter === 'unread') params.filter = 'unread';
      if (search.trim())       params.search = search.trim();
      const res = await getMessagesApi(params);
      setMessages(res.data.data || []);
    } catch {
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  /* ── Open message (auto-mark read) ────────────────────── */
  const openMessage = async (msg) => {
    setSelected(msg);
    if (!msg.is_read) {
      try {
        await markReadApi(msg.id);
        setMessages(ms => ms.map(m =>
          m.id === msg.id ? { ...m, is_read: true } : m
        ));
        setSelected(prev => prev?.id === msg.id ? { ...prev, is_read: true } : prev);
      } catch {
        /* non-fatal */
      }
    }
  };

  /* ── Delete ─────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMessageApi(deleteTarget.id);
      setMessages(ms => ms.filter(m => m.id !== deleteTarget.id));
      if (selected?.id === deleteTarget.id) setSelected(null);
    } catch {
      setError('Failed to delete message.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">
            Messages
            {unreadCount > 0 && (
              <span className="msg-unread-badge">{unreadCount}</span>
            )}
          </h1>
          <p className="page-subtitle">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
            {unreadCount > 0 ? ` — ${unreadCount} unread` : ''}
          </p>
        </div>
      </div>

      {error && <div className="alert alert--danger" style={{ marginBottom: 20 }}>{error}</div>}

      {/* ── Filter bar ────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <input
            type="text"
            placeholder="Search by name, phone or subject…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '9px 14px',
              border: '1.5px solid var(--border-color)', borderRadius: 6,
              fontSize: 13,
            }}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>
              ✕
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'unread'].map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}>
              {f === 'all' ? 'All Messages' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Spinner size="large" />
        </div>
      ) : messages.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p>{filter === 'unread' ? 'No unread messages.' : 'No messages yet.'}</p>
        </div>
      ) : (
        <div className="messages-layout">
          {/* ── Message list ─────────────────────────────── */}
          <div className="messages-list card" style={{ padding: 0, overflow: 'hidden' }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`message-row${selected?.id === msg.id ? ' message-row--active' : ''}${!msg.is_read ? ' message-row--unread' : ''}`}
                onClick={() => openMessage(msg)}
              >
                <div className="message-row__left">
                  <div className="message-row__avatar">
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="message-row__body">
                  <div className="message-row__top">
                    <span className="message-row__name">{msg.name}</span>
                    <span className="message-row__time">{formatDateTime(msg.created_at)}</span>
                  </div>
                  <div className="message-row__subject">{msg.subject}</div>
                  <div className="message-row__preview">{msg.preview}</div>
                </div>
                <div className="message-row__status">
                  {!msg.is_read
                    ? <span className="badge badge--red" style={{ fontSize: 10 }}>NEW</span>
                    : <span className="badge badge--grey" style={{ fontSize: 10 }}>Read</span>
                  }
                </div>
              </div>
            ))}
          </div>

          {/* ── Message detail ───────────────────────────── */}
          <div className="message-detail card">
            {selected ? (
              <>
                <div className="message-detail__header">
                  <div>
                    <h2 className="message-detail__subject">{selected.subject}</h2>
                    <div className="message-detail__meta">
                      <span>From: <strong>{selected.name}</strong></span>
                      {selected.email && <span> · {selected.email}</span>}
                    </div>
                    <div className="message-detail__meta">
                      <span>Phone: </span>
                      <a href={`tel:${selected.phone.replace(/\s/g, '')}`} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                        {selected.phone}
                      </a>
                      <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                        · {formatDateTime(selected.created_at)}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <a
                      href={`tel:${selected.phone.replace(/\s/g, '')}`}
                      className="btn btn-ghost btn-sm"
                      title="Call"
                    >
                      📞 Call
                    </a>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteTarget(selected)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="message-detail__body">
                  {selected.message}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: 12 }}>
                <div style={{ fontSize: 40 }}>✉️</div>
                <p style={{ fontSize: 14 }}>Select a message to read it</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Message"
        message={`Delete message from "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  );
};

export default MessagesPage;
