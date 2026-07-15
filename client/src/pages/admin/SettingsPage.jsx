import { useState } from 'react';
import { changePasswordApi } from '../../api/authApi';
import useAuth from '../../hooks/useAuth';
import Spinner from '../../components/common/Spinner';

const SettingsPage = () => {
  const { admin, logout } = useAuth();

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
    setApiError('');
    setSuccess('');
  };

  const validate = () => {
    const e = {};
    if (!form.currentPassword)
      e.currentPassword = 'Current password is required.';
    if (!form.newPassword || form.newPassword.length < 8)
      e.newPassword = 'New password must be at least 8 characters.';
    if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match.';
    if (form.currentPassword && form.newPassword && form.currentPassword === form.newPassword)
      e.newPassword = 'New password must be different from current password.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* Password strength */
  const strength = (() => {
    const p = form.newPassword;
    if (!p) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8)  score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: score, label: 'Weak',   color: '#CC1C1C' };
    if (score <= 3) return { level: score, label: 'Medium', color: '#E67E22' };
    return              { level: score, label: 'Strong',  color: '#27AE60' };
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await changePasswordApi({
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });
      setSuccess('Password changed successfully. You will be logged out in 3 seconds.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => logout(), 3000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your administrator account</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900 }}>

        {/* Change Password */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Change Password</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
            Choose a strong password. You will be logged out after a successful change.
          </p>

          {success && <div className="alert alert--success">{success}</div>}
          {apiError && <div className="alert alert--danger">{apiError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Current password */}
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="currentPassword" name="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={form.currentPassword} onChange={handleChange}
                  placeholder="Enter current password"
                  aria-invalid={!!errors.currentPassword}
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:16 }}>
                  {showCurrent ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.currentPassword && <span className="form-error">{errors.currentPassword}</span>}
            </div>

            {/* New password */}
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="newPassword" name="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={form.newPassword} onChange={handleChange}
                  placeholder="At least 8 characters"
                  aria-invalid={!!errors.newPassword}
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:16 }}>
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.newPassword && <span className="form-error">{errors.newPassword}</span>}

              {/* Strength bar */}
              {form.newPassword && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        background: i <= strength.level ? strength.color : 'var(--border-color)',
                        transition: 'background 0.2s',
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: strength.color, marginTop: 4, fontWeight: 600 }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword" name="confirmPassword"
                type="password"
                value={form.confirmPassword} onChange={handleChange}
                placeholder="Repeat new password"
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
              {saving
                ? <span style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}><Spinner size="small" color="white" /> Changing…</span>
                : '🔒 Change Password'
              }
            </button>
          </form>
        </div>

        {/* Account info */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Account Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <InfoRow label="Username"    value={admin?.username} />
              <InfoRow label="Role"        value="Administrator" />
              <InfoRow label="Session"     value="8 hours (JWT)" />
            </div>
          </div>

          <div className="card" style={{ background: 'var(--bg-body)' }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>
              Password Requirements
            </h2>
            {[
              'Minimum 8 characters',
              'Mix of uppercase and lowercase recommended',
              'Include numbers for better security',
              'Special characters (!, @, #) make it stronger',
              'Must be different from current password',
            ].map(r => (
              <div key={r} style={{ display:'flex', gap:8, marginBottom:8, fontSize:13, color:'var(--text-secondary)' }}>
                <span style={{ color:'var(--color-success)', flexShrink:0 }}>✓</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border-color)', fontSize:14 }}>
    <span style={{ color:'var(--text-muted)', fontWeight:500 }}>{label}</span>
    <span style={{ color:'var(--text-primary)', fontWeight:600 }}>{value || '—'}</span>
  </div>
);

export default SettingsPage;
