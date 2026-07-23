import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  getQuotationApi, createQuotationApi, updateQuotationApi,
  getQuotationPdfApi, updateStatusApi,
} from '../../api/quotationsApi';
import Spinner from '../../components/common/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import useAuth from '../../hooks/useAuth';

const EMPTY_ITEM = { description: '', quantity: 1, unit_price: 0 };
const STATUSES   = ['draft','sent','approved','rejected'];

const QuotationFormPage = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const isEdit    = Boolean(id);

  const [loading, setLoading]   = useState(isEdit);
  const [saving,  setSaving]    = useState(false);
  const [error,   setError]     = useState('');
  const [success, setSuccess]   = useState('');

  const [form, setForm] = useState({
    customer_name: '', phone: '', customer_address: '',
    vehicle_make: '', vehicle_model: '', vehicle_colour: '',
    vehicle_vin: '', registration_number: '', mileage: '',
    expiry_date: '', prepared_by: '', notes: '', status: 'draft',
    labour_cost: '', discount: '', vat_rate: '0',
  });
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [quotationNumber, setQuotationNumber] = useState('');

  /* Load existing quotation */
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await getQuotationApi(id);
        const q   = res.data.data;
        setQuotationNumber(q.quotation_number);
        setForm({
          customer_name:       q.customer_name    || '',
          phone:               q.phone            || '',
          customer_address:    q.customer_address || '',
          vehicle_make:        q.vehicle_make     || '',
          vehicle_model:       q.vehicle_model    || '',
          vehicle_colour:      q.vehicle_colour   || '',
          vehicle_vin:         q.vehicle_vin      || '',
          registration_number: q.registration_number || '',
          mileage:             q.mileage          || '',
          expiry_date:         q.expiry_date ? q.expiry_date.split('T')[0] : '',
          prepared_by:         q.prepared_by      || '',
          notes:               q.notes            || '',
          status:              q.status           || 'draft',
          labour_cost:         q.labour_cost      || '',
          discount:            q.discount         || '',
          vat_rate:            q.vat_amount > 0 ? '15' : '0',
        });
        setItems(q.items?.length ? q.items.map(it => ({
          description: it.description,
          quantity:    it.quantity,
          unit_price:  it.unit_price,
        })) : [{ ...EMPTY_ITEM }]);
      } catch { setError('Failed to load quotation.'); }
      finally { setLoading(false); }
    })();
  }, [id, isEdit]);

  /* Field change */
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  /* Items */
  const onItemChange = (i, field, value) => {
    setItems(its => its.map((it, idx) => idx === i ? { ...it, [field]: value } : it));
  };
  const addItem    = ()  => setItems(its => [...its, { ...EMPTY_ITEM }]);
  const removeItem = (i) => setItems(its => its.filter((_, idx) => idx !== i));

  /* Calculations */
  const subtotal   = items.reduce((s, it) => s + (parseFloat(it.unit_price) || 0) * (parseInt(it.quantity) || 0), 0);
  const labour     = parseFloat(form.labour_cost)  || 0;
  const discount   = parseFloat(form.discount)     || 0;
  const vatRate    = parseFloat(form.vat_rate)     || 0;
  const vatAmount  = vatRate > 0 ? (subtotal + labour - discount) * (vatRate / 100) : 0;
  const grandTotal = subtotal + labour - discount + vatAmount;

  const buildPayload = () => ({
    ...form,
    labour_cost: labour,
    discount,
    vat_rate: vatRate,
    expiry_date: form.expiry_date || null,
    items: items.filter(it => it.description.trim()),
  });

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!form.customer_name.trim()) return setError('Customer name is required.');
    if (!form.phone.trim())          return setError('Phone number is required.');
    if (!items.some(it => it.description.trim())) return setError('At least one item is required.');
    setSaving(true); setError(''); setSuccess('');
    try {
      if (isEdit) {
        await updateQuotationApi(id, buildPayload());
        setSuccess('Quotation saved.');
      } else {
        const res = await createQuotationApi(buildPayload());
        navigate(`/admin/quotations/${res.data.data.id}/edit`, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quotation.');
    } finally { setSaving(false); }
  };

  const openPdf = async () => {
    try {
      const res = await getQuotationPdfApi(id);
      const blobUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = blobUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch { setError('Failed to generate PDF.'); }
  };

  if (loading) return (
    <div className="page"><div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size="large" /></div></div>
  );

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">{isEdit ? `Edit ${quotationNumber}` : 'New Quotation'}</h1>
          <p className="page-subtitle"><Link to="/admin/quotations">← Back to Quotations</Link></p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isEdit && <button className="btn btn-ghost" onClick={openPdf}>📄 View PDF</button>}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><Spinner size="small" color="white" /> Saving…</> : '💾 Save'}
          </button>
        </div>
      </div>

      {error   && <div className="alert alert--danger"  style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert alert--success" style={{ marginBottom: 16 }}>{success}</div>}

      <form onSubmit={handleSave} noValidate>
        <div className="qf-grid">

          {/* ── Customer Details ─────────────────── */}
          <div className="card">
            <h3 className="qf-section-title">Customer Details</h3>
            <div className="qf-row">
              <div className="form-group qf-col-2">
                <label>Customer Name *</label>
                <input name="customer_name" value={form.customer_name} onChange={onChange} placeholder="Full name" required />
              </div>
              <div className="form-group qf-col-1">
                <label>Phone *</label>
                <input name="phone" value={form.phone} onChange={onChange} placeholder="e.g. 071 234 5678" required />
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input name="customer_address" value={form.customer_address} onChange={onChange} placeholder="Customer address" />
            </div>
          </div>

          {/* ── Vehicle Details ──────────────────── */}
          <div className="card">
            <h3 className="qf-section-title">Vehicle Details</h3>
            <div className="qf-row">
              <div className="form-group qf-col-1">
                <label>Make</label>
                <input name="vehicle_make" value={form.vehicle_make} onChange={onChange} placeholder="e.g. BMW" />
              </div>
              <div className="form-group qf-col-1">
                <label>Model</label>
                <input name="vehicle_model" value={form.vehicle_model} onChange={onChange} placeholder="e.g. 320i" />
              </div>
              <div className="form-group qf-col-1">
                <label>Colour</label>
                <input name="vehicle_colour" value={form.vehicle_colour} onChange={onChange} placeholder="e.g. White" />
              </div>
            </div>
            <div className="qf-row">
              <div className="form-group qf-col-1">
                <label>Registration</label>
                <input name="registration_number" value={form.registration_number} onChange={onChange} placeholder="e.g. LP 123 456" />
              </div>
              <div className="form-group qf-col-1">
                <label>Mileage</label>
                <input name="mileage" value={form.mileage} onChange={onChange} placeholder="e.g. 120 000 km" />
              </div>
              <div className="form-group qf-col-1">
                <label>VIN</label>
                <input name="vehicle_vin" value={form.vehicle_vin} onChange={onChange} placeholder="Optional" />
              </div>
            </div>
          </div>

        </div>

        {/* ── Quotation Meta ──────────────────────── */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 className="qf-section-title">Quotation Details</h3>
          <div className="qf-row">
            <div className="form-group qf-col-1">
              <label>Status</label>
              <select name="status" value={form.status} onChange={onChange}>
                {STATUSES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group qf-col-1">
              <label>Expiry Date</label>
              <input type="date" name="expiry_date" value={form.expiry_date} onChange={onChange} />
            </div>
            <div className="form-group qf-col-1">
              <label>Prepared By</label>
              <input name="prepared_by" value={form.prepared_by} onChange={onChange} placeholder="Your name" />
            </div>
          </div>
        </div>

        {/* ── Line Items ──────────────────────────── */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="qf-section-title" style={{ marginBottom: 0 }}>Line Items</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>+ Add Item</button>
          </div>

          <div className="qf-items-table">
            <div className="qf-items-header">
              <span style={{ flex: 4 }}>Description</span>
              <span style={{ flex: 1, textAlign: 'center' }}>Qty</span>
              <span style={{ flex: 1.5, textAlign: 'right' }}>Unit Price</span>
              <span style={{ flex: 1.5, textAlign: 'right' }}>Total</span>
              <span style={{ width: 32 }}></span>
            </div>

            {items.map((it, i) => {
              const lineTotal = (parseFloat(it.unit_price) || 0) * (parseInt(it.quantity) || 0);
              return (
                <div key={i} className="qf-item-row">
                  <input
                    style={{ flex: 4 }}
                    value={it.description}
                    onChange={e => onItemChange(i, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                  <input
                    type="number" min="1" style={{ flex: 1, textAlign: 'center' }}
                    value={it.quantity}
                    onChange={e => onItemChange(i, 'quantity', e.target.value)}
                  />
                  <input
                    type="number" min="0" step="0.01" style={{ flex: 1.5, textAlign: 'right' }}
                    value={it.unit_price}
                    onChange={e => onItemChange(i, 'unit_price', e.target.value)}
                    placeholder="0.00"
                  />
                  <span style={{ flex: 1.5, textAlign: 'right', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 8px' }}>
                    {formatCurrency(lineTotal)}
                  </span>
                  <button type="button" onClick={() => removeItem(i)}
                    style={{ width: 32, color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Totals + Notes ──────────────────────── */}
        <div className="qf-grid">
          <div className="card">
            <h3 className="qf-section-title">Notes</h3>
            <div className="form-group" style={{ margin: 0 }}>
              <textarea name="notes" value={form.notes} onChange={onChange}
                rows={4} placeholder="Additional notes or special instructions…" />
            </div>
          </div>

          <div className="card">
            <h3 className="qf-section-title">Totals</h3>
            <div className="qf-totals">
              <div className="qf-totals-row">
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <div className="qf-totals-row">
                <span>Labour Cost</span>
                <input type="number" min="0" step="0.01" name="labour_cost"
                  value={form.labour_cost} onChange={onChange}
                  className="qf-totals-input" placeholder="0.00" />
              </div>
              <div className="qf-totals-row">
                <span>Discount</span>
                <input type="number" min="0" step="0.01" name="discount"
                  value={form.discount} onChange={onChange}
                  className="qf-totals-input" placeholder="0.00" />
              </div>
              <div className="qf-totals-row">
                <span>VAT Rate</span>
                <select name="vat_rate" value={form.vat_rate} onChange={onChange} className="qf-totals-input">
                  <option value="0">No VAT</option>
                  <option value="15">15%</option>
                </select>
              </div>
              {vatAmount > 0 && (
                <div className="qf-totals-row">
                  <span>VAT (15%)</span>
                  <strong>{formatCurrency(vatAmount)}</strong>
                </div>
              )}
              <div className="qf-totals-row qf-totals-row--grand">
                <span>GRAND TOTAL</span>
                <strong>{formatCurrency(grandTotal)}</strong>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? <><Spinner size="small" color="white" /> Saving…</> : '💾 Save Quotation'}
          </button>
          {isEdit && (
            <button type="button" className="btn btn-ghost btn-lg" onClick={openPdf}>
              📄 View PDF
            </button>
          )}
          <Link to="/admin/quotations" className="btn btn-ghost btn-lg">Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default QuotationFormPage;
