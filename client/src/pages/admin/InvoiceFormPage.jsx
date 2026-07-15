import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getInvoiceApi, createInvoiceApi, updateInvoiceApi, getInvoicePdfUrl } from '../../api/invoicesApi';
import Spinner from '../../components/common/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';

const EMPTY_ITEM = { description: '', quantity: 1, unit_price: 0 };

const InvoiceFormPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    customer_name: '', phone: '', customer_address: '',
    vehicle_make: '', vehicle_model: '', vehicle_colour: '',
    vehicle_vin: '', registration_number: '', mileage: '',
    prepared_by: '', notes: '',
    payment_status: 'pending', payment_method: '', reference_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    labour_cost: '', discount: '', vat_rate: '0',
  });
  const [items, setItems]   = useState([{ ...EMPTY_ITEM }]);
  const [invoiceNum, setInvoiceNum] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await getInvoiceApi(id);
        const inv = res.data.data;
        setInvoiceNum(inv.invoice_number);
        setForm({
          customer_name:       inv.customer_name    || '',
          phone:               inv.phone            || '',
          customer_address:    inv.customer_address || '',
          vehicle_make:        inv.vehicle_make     || '',
          vehicle_model:       inv.vehicle_model    || '',
          vehicle_colour:      inv.vehicle_colour   || '',
          vehicle_vin:         inv.vehicle_vin      || '',
          registration_number: inv.registration_number || '',
          mileage:             inv.mileage          || '',
          prepared_by:         inv.prepared_by      || '',
          notes:               inv.notes            || '',
          payment_status:      inv.payment_status   || 'pending',
          payment_method:      inv.payment_method   || '',
          reference_number:    inv.reference_number || '',
          invoice_date:        inv.invoice_date ? inv.invoice_date.split('T')[0] : new Date().toISOString().split('T')[0],
          labour_cost:         inv.labour_cost      || '',
          discount:            inv.discount         || '',
          vat_rate:            inv.vat_amount > 0 ? '15' : '0',
        });
        setItems(inv.items?.length ? inv.items.map(it => ({
          description: it.description, quantity: it.quantity, unit_price: it.unit_price,
        })) : [{ ...EMPTY_ITEM }]);
      } catch { setError('Failed to load invoice.'); }
      finally { setLoading(false); }
    })();
  }, [id, isEdit]);

  const onChange = (e) => { const { name, value } = e.target; setForm(f => ({ ...f, [name]: value })); };
  const onItem   = (i, f, v) => setItems(its => its.map((it, idx) => idx === i ? { ...it, [f]: v } : it));
  const addItem  = () => setItems(its => [...its, { ...EMPTY_ITEM }]);
  const remItem  = (i) => setItems(its => its.filter((_, idx) => idx !== i));

  const subtotal   = items.reduce((s, it) => s + (parseFloat(it.unit_price)||0)*(parseInt(it.quantity)||0), 0);
  const labour     = parseFloat(form.labour_cost) || 0;
  const discount   = parseFloat(form.discount)    || 0;
  const vatRate    = parseFloat(form.vat_rate)    || 0;
  const vatAmount  = vatRate > 0 ? (subtotal + labour - discount) * (vatRate / 100) : 0;
  const grandTotal = subtotal + labour - discount + vatAmount;

  const payload = () => ({
    ...form,
    labour_cost: labour, discount, vat_rate: vatRate,
    items: items.filter(it => it.description.trim()),
  });

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!form.customer_name.trim()) return setError('Customer name is required.');
    if (!items.some(it => it.description.trim())) return setError('At least one item is required.');
    setSaving(true); setError(''); setSuccess('');
    try {
      if (isEdit) { await updateInvoiceApi(id, payload()); setSuccess('Invoice saved.'); }
      else {
        const res = await createInvoiceApi(payload());
        navigate(`/admin/invoices/${res.data.data.id}/edit`, { replace: true });
      }
    } catch (err) { setError(err.response?.data?.message || 'Failed to save invoice.'); }
    finally { setSaving(false); }
  };

  const openPdf = () => {
    const token = localStorage.getItem('mmms_token');
    fetch(getInvoicePdfUrl(id), { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob()).then(blob => window.open(URL.createObjectURL(blob), '_blank'));
  };

  if (loading) return <div className="page"><div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size="large" /></div></div>;

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">{isEdit ? `Edit ${invoiceNum}` : 'New Invoice'}</h1>
          <p className="page-subtitle"><Link to="/admin/invoices">← Back to Invoices</Link></p>
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
          <div className="card">
            <h3 className="qf-section-title">Customer Details</h3>
            <div className="qf-row">
              <div className="form-group qf-col-2"><label>Customer Name *</label><input name="customer_name" value={form.customer_name} onChange={onChange} placeholder="Full name" /></div>
              <div className="form-group qf-col-1"><label>Phone *</label><input name="phone" value={form.phone} onChange={onChange} placeholder="071 234 5678" /></div>
            </div>
            <div className="form-group"><label>Address</label><input name="customer_address" value={form.customer_address} onChange={onChange} /></div>
          </div>
          <div className="card">
            <h3 className="qf-section-title">Vehicle Details</h3>
            <div className="qf-row">
              <div className="form-group qf-col-1"><label>Make</label><input name="vehicle_make" value={form.vehicle_make} onChange={onChange} /></div>
              <div className="form-group qf-col-1"><label>Model</label><input name="vehicle_model" value={form.vehicle_model} onChange={onChange} /></div>
              <div className="form-group qf-col-1"><label>Colour</label><input name="vehicle_colour" value={form.vehicle_colour} onChange={onChange} /></div>
            </div>
            <div className="qf-row">
              <div className="form-group qf-col-1"><label>Registration</label><input name="registration_number" value={form.registration_number} onChange={onChange} /></div>
              <div className="form-group qf-col-1"><label>Mileage</label><input name="mileage" value={form.mileage} onChange={onChange} /></div>
              <div className="form-group qf-col-1"><label>VIN</label><input name="vehicle_vin" value={form.vehicle_vin} onChange={onChange} /></div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 className="qf-section-title">Invoice Details</h3>
          <div className="qf-row">
            <div className="form-group qf-col-1"><label>Invoice Date</label><input type="date" name="invoice_date" value={form.invoice_date} onChange={onChange} /></div>
            <div className="form-group qf-col-1"><label>Payment Status</label>
              <select name="payment_status" value={form.payment_status} onChange={onChange}>
                <option value="pending">Pending</option><option value="partial">Partially Paid</option><option value="paid">Paid</option>
              </select>
            </div>
            <div className="form-group qf-col-1"><label>Payment Method</label>
              <select name="payment_method" value={form.payment_method} onChange={onChange}>
                <option value="">— Select —</option><option value="cash">Cash</option><option value="eft">EFT</option><option value="card">Card</option>
              </select>
            </div>
          </div>
          <div className="qf-row">
            <div className="form-group qf-col-1"><label>Reference Number</label><input name="reference_number" value={form.reference_number} onChange={onChange} placeholder="EFT/POP ref" /></div>
            <div className="form-group qf-col-1"><label>Prepared By</label><input name="prepared_by" value={form.prepared_by} onChange={onChange} /></div>
          </div>
        </div>

        {/* Line items */}
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
              const lt = (parseFloat(it.unit_price)||0)*(parseInt(it.quantity)||0);
              return (
                <div key={i} className="qf-item-row">
                  <input style={{ flex: 4 }} value={it.description} onChange={e => onItem(i,'description',e.target.value)} placeholder="Description" />
                  <input type="number" min="1" style={{ flex: 1, textAlign: 'center' }} value={it.quantity} onChange={e => onItem(i,'quantity',e.target.value)} />
                  <input type="number" min="0" step="0.01" style={{ flex: 1.5, textAlign: 'right' }} value={it.unit_price} onChange={e => onItem(i,'unit_price',e.target.value)} />
                  <span style={{ flex: 1.5, textAlign: 'right', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 8px' }}>{formatCurrency(lt)}</span>
                  <button type="button" onClick={() => remItem(i)} style={{ width: 32, color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="qf-grid">
          <div className="card">
            <h3 className="qf-section-title">Notes</h3>
            <div className="form-group" style={{ margin: 0 }}>
              <textarea name="notes" value={form.notes} onChange={onChange} rows={4} placeholder="Additional notes…" />
            </div>
          </div>
          <div className="card">
            <h3 className="qf-section-title">Totals</h3>
            <div className="qf-totals">
              <div className="qf-totals-row"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
              <div className="qf-totals-row"><span>Labour Cost</span><input type="number" min="0" step="0.01" name="labour_cost" value={form.labour_cost} onChange={onChange} className="qf-totals-input" placeholder="0.00" /></div>
              <div className="qf-totals-row"><span>Discount</span><input type="number" min="0" step="0.01" name="discount" value={form.discount} onChange={onChange} className="qf-totals-input" placeholder="0.00" /></div>
              <div className="qf-totals-row"><span>VAT Rate</span>
                <select name="vat_rate" value={form.vat_rate} onChange={onChange} className="qf-totals-input">
                  <option value="0">No VAT</option><option value="15">15%</option>
                </select>
              </div>
              {vatAmount > 0 && <div className="qf-totals-row"><span>VAT (15%)</span><strong>{formatCurrency(vatAmount)}</strong></div>}
              <div className="qf-totals-row qf-totals-row--grand"><span>GRAND TOTAL</span><strong>{formatCurrency(grandTotal)}</strong></div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? <><Spinner size="small" color="white" /> Saving…</> : '💾 Save Invoice'}
          </button>
          {isEdit && <button type="button" className="btn btn-ghost btn-lg" onClick={openPdf}>📄 View PDF</button>}
          <Link to="/admin/invoices" className="btn btn-ghost btn-lg">Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default InvoiceFormPage;
