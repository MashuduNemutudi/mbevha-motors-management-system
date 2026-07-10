import { useState } from 'react';
import { useBusiness, toWaNumber } from '../../context/BusinessContext';
import { submitMessageApi }        from '../../api/messagesApi';
import PageBanner   from '../../components/common/PageBanner';
import SectionTitle from '../../components/common/SectionTitle';
import Spinner      from '../../components/common/Spinner';

const INITIAL     = { name: '', phone: '', email: '', subject: '', message: '' };
const ERRORS_INIT = { name: '', phone: '', email: '', subject: '', message: '' };

const SUBJECTS = [
  'General Enquiry',
  'Vehicle Repair',
  'Engine Repair / Swap',
  'Panel Beating & Painting',
  'Parts Enquiry',
  'Vehicle Servicing',
  'BMW Diagnostics',
  'Other',
];

const parseHours = (raw = '') =>
  raw.split('|').map(seg => {
    const s = seg.trim();
    const i = s.indexOf(':');
    if (i === -1) return { day: s, time: 'Closed' };
    return { day: s.slice(0, i).trim(), time: s.slice(i + 1).trim() };
  }).filter(r => r.day);

const ContactPage = () => {
  const { business } = useBusiness();
  const waHref       = `https://wa.me/${toWaNumber(business.whatsapp_number)}`;
  const phoneHref    = `tel:${(business.phone || '').replace(/\s/g, '')}`;
  const phoneDisplay = business.phone || '071 306 5615';
  const hoursRows    = parseHours(business.opening_hours);

  const [form, setForm]             = useState(INITIAL);
  const [errors, setErrors]         = useState(ERRORS_INIT);
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState('');

  const validate = () => {
    const e = { ...ERRORS_INIT };
    if (!form.name.trim()    || form.name.trim().length < 2)
      e.name = 'Please enter your full name (at least 2 characters).';
    if (!form.phone.trim()   || !/^[0-9+\s\-]{7,15}$/.test(form.phone.trim()))
      e.phone = 'Please enter a valid phone number.';
    if (!form.subject)
      e.subject = 'Please select a subject.';
    if (!form.message.trim() || form.message.trim().length < 10)
      e.message = 'Please enter a message (at least 10 characters).';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = 'Please enter a valid email address.';
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError('');
    try {
      await submitMessageApi(form);
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message;
      // Rate limit message is human-readable
      if (err.response?.status === 429) {
        setApiError('Too many submissions. Please wait 15 minutes before trying again.');
      } else {
        setApiError(msg || 'Failed to send your message. Please try again or contact us by phone.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <PageBanner
        overline="Contact Us"
        title="Get In Touch"
        sub="We're ready to help — call, WhatsApp, or send us a message"
        bgImage="/images/gallery/img-entrance-close.jpg"
      />

      <section className="section">
        <div className="container">
          <div className="contact-grid">

            {/* ── Contact information ─────────────────────── */}
            <div>
              <SectionTitle overline="Contact Details" heading="Find Us" />
              <div className="contact-card">
                <h3 className="contact-card__heading">
                  {business.business_name || 'Mbevha Motors (Pty) Ltd'}
                </h3>

                <div className="contact-info-item">
                  <div className="contact-info-item__icon">📞</div>
                  <div>
                    <div className="contact-info-item__label">Phone</div>
                    <div className="contact-info-item__value">
                      <a href={phoneHref}>{phoneDisplay}</a>
                    </div>
                  </div>
                </div>

                {business.whatsapp_number && (
                  <div className="contact-info-item">
                    <div className="contact-info-item__icon">📲</div>
                    <div>
                      <div className="contact-info-item__label">WhatsApp</div>
                      <div className="contact-info-item__value">
                        <a href={`${waHref}?text=${encodeURIComponent('Hi Mbevha Motors, I would like to enquire.')}`}
                           target="_blank" rel="noreferrer">
                          {business.whatsapp_number}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                <div className="contact-info-item">
                  <div className="contact-info-item__icon">📍</div>
                  <div>
                    <div className="contact-info-item__label">Address</div>
                    <div className="contact-info-item__value">
                      {business.address
                        ? business.address.split(',').map((l, i) => (
                            <span key={i} style={{ display: 'block' }}>{l.trim()}</span>
                          ))
                        : <>Dzwerani, Mahematshena<br />Vuwani Road<br />Opposite Mavikos</>
                      }
                    </div>
                  </div>
                </div>

                {business.email && (
                  <div className="contact-info-item">
                    <div className="contact-info-item__icon">✉️</div>
                    <div>
                      <div className="contact-info-item__label">Email</div>
                      <div className="contact-info-item__value">
                        <a href={`mailto:${business.email}`}>{business.email}</a>
                      </div>
                    </div>
                  </div>
                )}

                <div className="contact-info-item">
                  <div className="contact-info-item__icon">🕐</div>
                  <div>
                    <div className="contact-info-item__label">Working Hours</div>
                    <div className="contact-info-item__value">
                      {hoursRows.length > 0 ? (
                        <table className="hours-table">
                          <tbody>
                            {hoursRows.map((row, i) => (
                              <tr key={i}>
                                <td>{row.day}</td>
                                <td className={row.time.toLowerCase() === 'closed' ? 'closed' : ''}>
                                  {row.time}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <table className="hours-table">
                          <tbody>
                            <tr><td>Monday – Friday</td><td>07:30 – 17:00</td></tr>
                            <tr><td>Saturday</td><td>08:00 – 13:00</td></tr>
                            <tr><td>Sunday</td><td className="closed">Closed</td></tr>
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 24 }}>
                  <a href={`${waHref}?text=${encodeURIComponent('Hi Mbevha Motors!')}`}
                     target="_blank" rel="noreferrer"
                     className="btn btn-whatsapp btn-full">
                    📲 Open WhatsApp Chat
                  </a>
                </div>

                <div className="contact-map" style={{ marginTop: 24 }}>
                  {business.google_maps_link ? (
                    <iframe
                      title="Mbevha Motors Location"
                      src={business.google_maps_link}
                      allowFullScreen loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                  ) : (
                    <div className="contact-map-placeholder">
                      <span>📍</span>
                      <span>Map configured by administrator</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Contact form ─────────────────────────────── */}
            <div className="contact-form-card">
              <SectionTitle overline="Send a Message" heading="Enquire Online" />
              <div className="contact-card" style={{ flex: 1 }}>
                {submitted ? (
                  <div className="contact-form-success">
                    <div className="contact-form-success__icon">✅</div>
                    <h3 className="contact-form-success__title">Message Sent!</h3>
                    <p className="contact-form-success__sub">
                      Thank you, <strong>{form.name}</strong>. We received your message
                      and will contact you on <strong>{form.phone}</strong> shortly.
                    </p>
                    <button
                      className="btn btn-outline-red"
                      style={{ marginTop: 24 }}
                      onClick={() => { setSubmitted(false); setForm(INITIAL); }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form className="contact-form" onSubmit={handleSubmit} noValidate>
                    {apiError && (
                      <div className="alert alert--danger" style={{ marginBottom: 16 }}>
                        {apiError}
                      </div>
                    )}

                    {/* Name + Phone row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="form-group">
                        <label htmlFor="c-name">Full Name *</label>
                        <input id="c-name" name="name" type="text"
                          placeholder="e.g. John Maphosa"
                          value={form.name} onChange={handleChange}
                          aria-invalid={!!errors.name} />
                        {errors.name && <span className="form-error">{errors.name}</span>}
                      </div>
                      <div className="form-group">
                        <label htmlFor="c-phone">Phone Number *</label>
                        <input id="c-phone" name="phone" type="tel"
                          placeholder="e.g. 071 234 5678"
                          value={form.phone} onChange={handleChange}
                          aria-invalid={!!errors.phone} />
                        {errors.phone && <span className="form-error">{errors.phone}</span>}
                      </div>
                    </div>

                    {/* Email (optional) */}
                    <div className="form-group">
                      <label htmlFor="c-email">
                        Email Address
                        <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 6, fontWeight: 400 }}>
                          optional
                        </span>
                      </label>
                      <input id="c-email" name="email" type="email"
                        placeholder="e.g. john@example.com"
                        value={form.email} onChange={handleChange}
                        aria-invalid={!!errors.email} />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>

                    {/* Subject */}
                    <div className="form-group">
                      <label htmlFor="c-subject">Subject *</label>
                      <select id="c-subject" name="subject"
                        value={form.subject} onChange={handleChange}
                        aria-invalid={!!errors.subject}>
                        <option value="">Select a subject…</option>
                        {SUBJECTS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.subject && <span className="form-error">{errors.subject}</span>}
                    </div>

                    {/* Message */}
                    <div className="form-group">
                      <label htmlFor="c-message">Message *</label>
                      <textarea id="c-message" name="message" rows={5}
                        placeholder="Tell us about your vehicle and what you need help with…"
                        value={form.message} onChange={handleChange}
                        aria-invalid={!!errors.message} />
                      {errors.message && <span className="form-error">{errors.message}</span>}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-full btn-lg"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                          <Spinner size="small" color="white" /> Sending…
                        </span>
                      ) : 'Send Message →'}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--clr-grey-500)' }}>
                      Prefer instant response?{' '}
                      <a href={waHref} target="_blank" rel="noreferrer"
                         style={{ color: '#25d366', fontWeight: 600 }}>
                        WhatsApp us directly
                      </a>
                    </p>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
