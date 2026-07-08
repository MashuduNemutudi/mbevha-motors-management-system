import { useState } from 'react';
import { useBusiness, toWaNumber } from '../../context/BusinessContext';
import PageBanner   from '../../components/common/PageBanner';
import SectionTitle from '../../components/common/SectionTitle';

const INITIAL      = { name: '', phone: '', message: '' };
const ERRORS_INIT  = { name: '', phone: '', message: '' };

/* Parse "Mon–Fri: 07:30–17:00 | Sat: 08:00–13:00 | Sun: Closed" into rows */
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

  const [form, setForm]           = useState(INITIAL);
  const [errors, setErrors]       = useState(ERRORS_INIT);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = { ...ERRORS_INIT };
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = 'Please enter your full name (at least 2 characters).';
    if (!form.phone.trim() || !/^[0-9+\s\-]{7,15}$/.test(form.phone.trim()))
      e.phone = 'Please enter a valid phone number.';
    if (!form.message.trim() || form.message.trim().length < 10)
      e.message = 'Please enter a message (at least 10 characters).';
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    /* Phase 6: replace with real API call → await api.post('/messages', form) */
    await new Promise(r => setTimeout(r, 900));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <main>
      <PageBanner overline="Contact Us" title="Get In Touch"
        sub="We're ready to help — call, WhatsApp, or send us a message"
        bgImage="/images/gallery/img-entrance-close.jpg" />

      <section className="section">
        <div className="container">
          <div className="contact-grid">

            {/* ── Contact info ───────────────────────────── */}
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
                        <>
                          <table className="hours-table"><tbody>
                            <tr><td>Monday – Friday</td><td>07:30 – 17:00</td></tr>
                            <tr><td>Saturday</td><td>08:00 – 13:00</td></tr>
                            <tr><td>Sunday</td><td className="closed">Closed</td></tr>
                          </tbody></table>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <a href={`${waHref}?text=${encodeURIComponent('Hi Mbevha Motors!')}`}
                     target="_blank" rel="noreferrer"
                     className="btn btn-whatsapp btn-full">
                    📲 Open WhatsApp Chat
                  </a>
                </div>

                {/* Google Maps */}
                <div className="contact-map" style={{ marginTop: '24px' }}>
                  {business.google_maps_link ? (
                    <iframe title="Mbevha Motors Location"
                      src={business.google_maps_link}
                      allowFullScreen loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      style={{ width: '100%', height: '100%', border: 'none' }} />
                  ) : (
                    <div className="contact-map-placeholder">
                      <span>📍</span>
                      <span>Map will appear once configured by the administrator.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Contact form ────────────────────────────── */}
            <div className="contact-form-card">
              <SectionTitle overline="Send a Message" heading="Enquire Online" />
              <div className="contact-card" style={{ flex: 1 }}>
                {submitted ? (
                  <div className="contact-form-success">
                    <div className="contact-form-success__icon">✅</div>
                    <h3 className="contact-form-success__title">Message Sent!</h3>
                    <p className="contact-form-success__sub">
                      Thank you for reaching out. We will contact you on
                      <strong> {form.phone}</strong> shortly.
                    </p>
                    <button className="btn btn-outline-red" style={{ marginTop: '24px' }}
                      onClick={() => { setSubmitted(false); setForm(INITIAL); }}>
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form className="contact-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input id="name" name="name" type="text"
                        placeholder="e.g. John Maphosa"
                        value={form.name} onChange={handleChange}
                        aria-invalid={!!errors.name} />
                      {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number *</label>
                      <input id="phone" name="phone" type="tel"
                        placeholder="e.g. 071 234 5678"
                        value={form.phone} onChange={handleChange}
                        aria-invalid={!!errors.phone} />
                      {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="message">Message *</label>
                      <textarea id="message" name="message" rows={6}
                        placeholder="Tell us about your vehicle and what you need help with…"
                        value={form.message} onChange={handleChange}
                        aria-invalid={!!errors.message} />
                      {errors.message && <span className="form-error">{errors.message}</span>}
                    </div>
                    <button type="submit" className="btn btn-primary btn-full btn-lg"
                      disabled={submitting}>
                      {submitting ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                          <span className="spinner spinner--small spinner--white" style={{ display: 'inline-block' }}>
                            <span className="spinner__circle" />
                          </span>
                          Sending…
                        </span>
                      ) : 'Send Message →'}
                    </button>
                    <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--clr-grey-500)' }}>
                      Prefer instant response?{' '}
                      <a href={waHref} target="_blank" rel="noreferrer"
                         style={{ color: '#25d366', fontWeight: '600' }}>
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
