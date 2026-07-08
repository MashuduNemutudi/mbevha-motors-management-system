/**
 * pages/admin/BusinessInfoPage.jsx
 * Full business information editor.
 * Loads from GET /api/business, saves to PUT /api/business.
 * After saving, refreshes BusinessContext so the public website
 * reflects changes immediately without a page reload.
 */

import { useState, useEffect } from 'react';
import { getBusinessInfo, updateBusinessInfo } from '../../api/businessApi';
import { useBusiness } from '../../context/BusinessContext';
import Spinner from '../../components/common/Spinner';

const FIELDS = [
  { key: 'business_name',    label: 'Business Name',         type: 'text',     required: true,  placeholder: 'e.g. Mbevha Motors (Pty) Ltd',       maxLength: 150 },
  { key: 'motto',            label: 'Motto / Tagline',       type: 'text',     required: false, placeholder: 'e.g. Notable Hands, We Do Quality.', maxLength: 255 },
  { key: 'phone',            label: 'Phone Number',          type: 'text',     required: true,  placeholder: 'e.g. 071 306 5615',                  maxLength: 20  },
  { key: 'whatsapp_number',  label: 'WhatsApp Number',       type: 'text',     required: false, placeholder: 'e.g. 061 518 8643',                  maxLength: 20  },
  { key: 'email',            label: 'Email Address',         type: 'email',    required: false, placeholder: 'Leave blank if none',                maxLength: 100 },
  { key: 'address',          label: 'Physical Address',      type: 'textarea', required: true,  placeholder: 'Full street address',                rows: 3        },
  { key: 'about',            label: 'About Us',              type: 'textarea', required: false, placeholder: 'A description of the business…',     rows: 5        },
  {
    key: 'opening_hours', label: 'Opening Hours', type: 'textarea', required: false,
    placeholder: 'Mon–Fri: 07:30–17:00 | Sat: 08:00–13:00 | Sun: Closed',
    rows: 3,
    hint: 'Separate each period with a pipe  |  so the website can parse and display them correctly.',
  },
  {
    key: 'google_maps_link', label: 'Google Maps Embed URL', type: 'textarea', required: false,
    placeholder: 'https://www.google.com/maps/embed?pb=…', rows: 3,
    hint: 'In Google Maps: Share → Embed a map → Copy the src="…" URL only.',
  },
];

const EMPTY = {
  business_name: '', motto: '', phone: '', whatsapp_number: '',
  email: '', address: '', about: '', opening_hours: '', google_maps_link: '',
};

const BusinessInfoPage = () => {
  const { refresh: refreshContext } = useBusiness();

  const [form, setForm]             = useState(EMPTY);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState('');
  const [error, setError]           = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  /* Load current values on mount */
  useEffect(() => {
    (async () => {
      try {
        const res = await getBusinessInfo();
        if (res.data?.success && res.data?.data) {
          const d = res.data.data;
          setForm({
            business_name:    d.business_name    || '',
            motto:            d.motto            || '',
            phone:            d.phone            || '',
            whatsapp_number:  d.whatsapp_number  || '',
            email:            d.email            || '',
            address:          d.address          || '',
            about:            d.about            || '',
            opening_hours:    d.opening_hours    || '',
            google_maps_link: d.google_maps_link || '',
          });
          setLastUpdated(d.updated_at);
        }
      } catch {
        setError('Failed to load business information. Please refresh.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(fe => ({ ...fe, [name]: '' }));
    if (success) setSuccess('');
    if (error)   setError('');
  };

  const validate = () => {
    const fe = {};
    if (!form.business_name.trim() || form.business_name.trim().length < 2)
      fe.business_name = 'Business name is required (minimum 2 characters).';
    if (!form.phone.trim() || form.phone.trim().length < 7)
      fe.phone = 'Phone number is required (minimum 7 characters).';
    if (!form.address.trim() || form.address.trim().length < 5)
      fe.address = 'Address is required (minimum 5 characters).';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      fe.email = 'Please enter a valid email address.';
    setFieldErrors(fe);
    return Object.keys(fe).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      const res = await updateBusinessInfo(form);
      if (res.data?.success) {
        setSuccess('Business information saved successfully.');
        setLastUpdated(res.data.data?.updated_at || new Date().toISOString());
        await refreshContext(); // update Navbar, Footer, all public pages immediately
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-header"><h1 className="page-title">Business Information</h1></div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Spinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Business Information</h1>
        <p className="page-subtitle">
          Changes here update the public website immediately.
          {lastUpdated && (
            <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '8px' }}>
              Last saved: {new Date(lastUpdated).toLocaleString('en-ZA')}
            </span>
          )}
        </p>
      </div>

      {success && (
        <div className="alert alert--success" style={{ marginBottom: '24px' }}>
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="alert alert--danger" style={{ marginBottom: '24px' }}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* Left column */}
          <div>
            <div className="card" style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                🏢 Business Details
              </h2>
              {FIELDS.slice(0, 5).map(f => (
                <FieldGroup key={f.key} field={f} value={form[f.key]} onChange={handleChange} error={fieldErrors[f.key]} />
              ))}
            </div>

            <div className="card">
              <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                ℹ️ About the Business
              </h2>
              <FieldGroup field={FIELDS[6]} value={form[FIELDS[6].key]} onChange={handleChange} error={fieldErrors[FIELDS[6].key]} />
            </div>
          </div>

          {/* Right column */}
          <div>
            <div className="card" style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                📍 Location & Hours
              </h2>
              <FieldGroup field={FIELDS[5]} value={form[FIELDS[5].key]} onChange={handleChange} error={fieldErrors[FIELDS[5].key]} />
              <FieldGroup field={FIELDS[7]} value={form[FIELDS[7].key]} onChange={handleChange} error={fieldErrors[FIELDS[7].key]} />
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                🗺️ Google Maps
              </h2>
              <FieldGroup field={FIELDS[8]} value={form[FIELDS[8].key]} onChange={handleChange} error={fieldErrors[FIELDS[8].key]} />
              {form.google_maps_link && (
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Preview:</p>
                  <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden' }}>
                    <iframe title="Map preview" src={form.google_maps_link}
                      style={{ width: '100%', height: '100%', border: 'none' }} loading="lazy" />
                  </div>
                </div>
              )}
            </div>

            {/* Hours preview */}
            {form.opening_hours && (
              <div className="card">
                <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🕐 Hours Preview</h2>
                {form.opening_hours.split('|').map((seg, i) => {
                  const s = seg.trim();
                  const ci = s.indexOf(':');
                  const day  = ci === -1 ? s : s.slice(0, ci).trim();
                  const time = ci === -1 ? '' : s.slice(ci + 1).trim();
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{day}</span>
                      <span style={{ color: time.toLowerCase() === 'closed' ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                        {time || 'Closed'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Spinner size="small" color="white" /> Saving…
              </span>
            ) : '💾 Save Changes'}
          </button>
          {success && (
            <span style={{ color: 'var(--color-success)', fontSize: '14px', fontWeight: '600' }}>
              ✅ Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

/* Reusable field component */
const FieldGroup = ({ field, value, onChange, error }) => (
  <div className="form-group">
    <label htmlFor={field.key}>
      {field.label}
      {field.required && <span style={{ color: 'var(--color-danger)', marginLeft: '3px' }}>*</span>}
      {field.maxLength && (
        <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginLeft: '6px', fontWeight: '400' }}>
          {(value || '').length}/{field.maxLength}
        </span>
      )}
    </label>
    {field.type === 'textarea' ? (
      <textarea id={field.key} name={field.key} value={value} onChange={onChange}
        placeholder={field.placeholder} rows={field.rows || 3}
        maxLength={field.maxLength} aria-invalid={!!error} />
    ) : (
      <input id={field.key} name={field.key} type={field.type || 'text'}
        value={value} onChange={onChange} placeholder={field.placeholder}
        maxLength={field.maxLength} aria-invalid={!!error} />
    )}
    {field.hint && (
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
        💡 {field.hint}
      </span>
    )}
    {error && <span className="form-error">{error}</span>}
  </div>
);

export default BusinessInfoPage;
