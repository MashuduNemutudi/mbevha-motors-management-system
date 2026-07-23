import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  getJobCardApi, createJobCardApi, updateJobCardApi, getJobCardPdfApi,
} from '../../api/jobCardsApi';
import Spinner from '../../components/common/Spinner';

const ALL_ITEMS = [
  'Key', 'Speakers', 'Seat Covers',
  'Radio', 'Car Mats', 'Jack',
  'Memory Stick', 'Amplifier', 'Wheel Spanner',
  'Warning Triangle', 'Spare Wheel', 'Fire Extinguisher',
];

const EMPTY = {
  job_date:             new Date().toISOString().split('T')[0],
  vehicle_make:         '',
  registration_number:  '',
  vehicle_colour:       '',
  vehicle_vin:          '',
  mileage:              '',
  owner_name:           '',
  id_number:            '',
  contact_number:       '',
  residential_address:  '',
  job_description:      '',
  items_checklist:      [],
  battery_type:         '',
  battery_colour:       '',
  battery_size:         '',
  technician_name:      '',
  status:               'open',
  received_by:          '',
  notes:                '',
};

/* ─────────────────────────────────────────────────────────────
   FieldGroup MUST live OUTSIDE the page component.
   If defined inside, React creates a new component type on every
   render (every keystroke), unmounts the input, and focus is lost
   after each character typed.
───────────────────────────────────────────────────────────── */
const FieldGroup = ({ label, name, type, required, value, onChange, children, style }) => (
  <div className="form-group" style={style}>
    <label htmlFor={name}>
      {label}
      {required && <span style={{ color: 'var(--color-danger)', marginLeft: 3 }}>*</span>}
    </label>
    {children || (
      <input
        id={name}
        name={name}
        type={type || 'text'}
        value={value || ''}
        onChange={onChange}
      />
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   SectionCard — thin wrapper for card sections
───────────────────────────────────────────────────────────── */
const SectionCard = ({ icon, title, children }) => (
  <div className="card" style={{ marginBottom: 20 }}>
    <h3 style={{
      fontSize: 14, fontWeight: 700, marginBottom: 16,
      paddingBottom: 10, borderBottom: '1px solid var(--border-color)',
    }}>
      {icon} {title}
    </h3>
    {children}
  </div>
);

const FLEX_ROW = { display: 'flex', gap: 16, flexWrap: 'wrap' };
const HALF     = { flex: 1, minWidth: 180 };

/* ───────────────────────────────────────────────────────────── */
const JobCardFormPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  const [form,     setForm]     = useState(EMPTY);
  const [loading,  setLoading]  = useState(isEdit);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [pdfLoad,  setPdfLoad]  = useState(false);

  /* Load existing job card for editing */
  useEffect(() => {
    if (!isEdit) return;
    getJobCardApi(id)
      .then(r => {
        const d = r.data.data;
        setForm({
          ...EMPTY,
          ...d,
          items_checklist: Array.isArray(d.items_checklist) ? d.items_checklist : [],
          job_date: d.job_date ? d.job_date.split('T')[0] : EMPTY.job_date,
        });
      })
      .catch(() => setError('Failed to load job card.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const toggleItem = item => {
    setForm(prev => ({
      ...prev,
      items_checklist: prev.items_checklist.includes(item)
        ? prev.items_checklist.filter(i => i !== item)
        : [...prev.items_checklist, item],
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.owner_name.trim())     return setError('Owner name is required.');
    if (!form.contact_number.trim()) return setError('Contact number is required.');
    setSaving(true);
    try {
      if (isEdit) {
        await updateJobCardApi(id, form);
        setSuccess('Job card updated successfully.');
      } else {
        const res = await createJobCardApi(form);
        setSuccess(`Job card ${res.data.data.job_card_number} created.`);
        setTimeout(() => navigate('/admin/job-cards'), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job card.');
    } finally {
      setSaving(false);
    }
  };

  const handlePdf = async () => {
    setPdfLoad(true);
    try {
      const res = await getJobCardPdfApi(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a   = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to generate PDF.');
    } finally {
      setPdfLoad(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Spinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Page header */}
      <div className="page-header" style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Job Card' : 'New Job Card'}</h1>
          {isEdit && form.job_card_number && (
            <p className="page-subtitle" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              {form.job_card_number}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isEdit && (
            <button onClick={handlePdf} disabled={pdfLoad} className="btn btn-ghost">
              {pdfLoad ? <Spinner size="small" /> : '🖨️ Download PDF'}
            </button>
          )}
          <Link to="/admin/job-cards" className="btn btn-ghost">← Back</Link>
        </div>
      </div>

      {error   && <div className="alert alert--danger"  style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert alert--success" style={{ marginBottom: 16 }}>{success}</div>}

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Job Info ──────────────────────────────────────── */}
        <SectionCard icon="📋" title="Job Information">
          <div style={FLEX_ROW}>
            <FieldGroup label="Job Date"        name="job_date"        type="date" style={HALF} value={form.job_date}        onChange={handleChange} />
            <FieldGroup label="Technician Name" name="technician_name" style={HALF}             value={form.technician_name} onChange={handleChange} />
            <FieldGroup label="Status" name="status" style={HALF} value={form.status} onChange={handleChange}>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Received By" name="received_by" style={HALF} value={form.received_by} onChange={handleChange} />
          </div>
        </SectionCard>

        {/* ── Vehicle ───────────────────────────────────────── */}
        <SectionCard icon="🚗" title="Vehicle Details">
          <div style={FLEX_ROW}>
            <FieldGroup label="Vehicle Make"         name="vehicle_make"        style={HALF} value={form.vehicle_make}        onChange={handleChange} />
            <FieldGroup label="Registration Number"  name="registration_number" style={HALF} value={form.registration_number} onChange={handleChange} />
            <FieldGroup label="Colour"               name="vehicle_colour"      style={HALF} value={form.vehicle_colour}      onChange={handleChange} />
            <FieldGroup label="VIN Number"           name="vehicle_vin"         style={HALF} value={form.vehicle_vin}         onChange={handleChange} />
            <FieldGroup label="Mileage"              name="mileage"             style={HALF} value={form.mileage}             onChange={handleChange} />
          </div>
        </SectionCard>

        {/* ── Owner ─────────────────────────────────────────── */}
        <SectionCard icon="👤" title="Owner Details">
          <div style={FLEX_ROW}>
            <FieldGroup label="Owner Name"         name="owner_name"          required style={HALF}           value={form.owner_name}          onChange={handleChange} />
            <FieldGroup label="ID Number"          name="id_number"           style={HALF}                   value={form.id_number}           onChange={handleChange} />
            <FieldGroup label="Contact Number"     name="contact_number"      required style={HALF}           value={form.contact_number}      onChange={handleChange} />
            <FieldGroup label="Residential Address" name="residential_address" style={{ flex: 2, minWidth: 240 }} value={form.residential_address} onChange={handleChange} />
          </div>
        </SectionCard>

        {/* ── Job Description ───────────────────────────────── */}
        <SectionCard icon="🔧" title="Job Description">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="job_description">Job Description</label>
            <textarea
              id="job_description"
              name="job_description"
              rows={4}
              value={form.job_description || ''}
              onChange={handleChange}
              placeholder="Describe the work to be done or issues reported by the owner…"
            />
          </div>
        </SectionCard>

        {/* ── Items Checklist ───────────────────────────────── */}
        <SectionCard icon="✅" title="Items Found in Vehicle">
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Tick all items that were present when the vehicle was received.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px 20px' }}>
            {ALL_ITEMS.map(item => (
              <label
                key={item}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer', fontSize: 13,
                  fontWeight: form.items_checklist.includes(item) ? 700 : 400,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.items_checklist.includes(item)}
                  onChange={() => toggleItem(item)}
                  style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
                {item}
              </label>
            ))}
          </div>
        </SectionCard>

        {/* ── Battery ───────────────────────────────────────── */}
        <SectionCard icon="🔋" title="Battery Information">
          <div style={FLEX_ROW}>
            <FieldGroup label="Battery Type"   name="battery_type"   style={HALF} value={form.battery_type}   onChange={handleChange} />
            <FieldGroup label="Battery Colour" name="battery_colour" style={HALF} value={form.battery_colour} onChange={handleChange} />
            <FieldGroup label="Battery Size"   name="battery_size"   style={HALF} value={form.battery_size}   onChange={handleChange} />
          </div>
        </SectionCard>

        {/* ── Notes ─────────────────────────────────────────── */}
        <SectionCard icon="📝" title="Additional Notes">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={form.notes || ''}
              onChange={handleChange}
              placeholder="Any additional notes for this job card…"
            />
          </div>
        </SectionCard>

        {/* ── Submit ────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Spinner size="small" color="white" /> Saving…
              </span>
            ) : isEdit ? '💾 Update Job Card' : '✅ Create Job Card'}
          </button>
          <Link to="/admin/job-cards" className="btn btn-ghost btn-lg">Cancel</Link>
        </div>

      </form>
    </div>
  );
};

export default JobCardFormPage;
