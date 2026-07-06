import { useState } from 'react';
import PageBanner from '../../components/common/PageBanner';
import SectionTitle from '../../components/common/SectionTitle';

const WA = '27713065615';

const INITIAL = { name: '', phone: '', message: '' };
const ERRORS_INIT = { name: '', phone: '', message: '' };

const ContactPage = () => {
  const [form, setForm]       = useState(INITIAL);
  const [errors, setErrors]   = useState(ERRORS_INIT);
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
    /* Phase 6: replace this timeout with real API call
       await api.post('/messages', form);
    */
    await new Promise(r => setTimeout(r, 900));
    setSubmitting(false);
    setSubmitted(true);
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

            {/* ── Left: contact info ───────────────────── */}
            <div>
              <SectionTitle overline="Contact Details" heading="Find Us" />

              <div className="contact-card">
                <h3 className="contact-card__heading">Mbevha Motors (Pty) Ltd</h3>

                <div className="contact-info-item">
                  <div className="contact-info-item__icon">📞</div>
                  <div>
                    <div className="contact-info-item__label">Phone</div>
                    <div className="contact-info-item__value">
                      <a href="tel:0713065615">071 306 5615</a>
                    </div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-item__icon">📲</div>
                  <div>
                    <div className="contact-info-item__label">WhatsApp</div>
                    <div className="contact-info-item__value">
                      <a
                        href={`https://wa.me/${WA}?text=Hi%20Mbevha%20Motors,%20I%20would%20like%20to%20enquire.`}
                        target="_blank" rel="noreferrer"
                      >
                        Chat with us on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-item__icon">📍</div>
                  <div>
                    <div className="contact-info-item__label">Address</div>
                    <div className="contact-info-item__value">
                      Dzwerani, Mahematshena<br />
                      Vuwani Road<br />
                      Opposite Mavikos
                    </div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-item__icon">✉️</div>
                  <div>
                    <div className="contact-info-item__label">Email</div>
                    <div className="contact-info-item__value">
                      <a href="mailto:info@mbevhamotors.co.za">
                        info@mbevhamotors.co.za
                      </a>
                    </div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-item__icon">🕐</div>
                  <div>
                    <div className="contact-info-item__label">Working Hours</div>
                    <div className="contact-info-item__value">
                      <table className="hours-table">
                        <tbody>
                          <tr>
                            <td>Monday – Friday</td>
                            <td>08:00 – 17:00</td>
                          </tr>
                          <tr>
                            <td>Saturday</td>
                            <td>08:00 – 13:00</td>
                          </tr>
                          <tr>
                            <td>Sunday</td>
                            <td className="closed">Closed</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <div style={{ marginTop: '24px' }}>
                  <a
                    href={`https://wa.me/${WA}?text=Hi%20Mbevha%20Motors!`}
                    target="_blank" rel="noreferrer"
                    className="btn btn-whatsapp btn-full"
                  >
                    📲 Open WhatsApp Chat
                  </a>
                </div>

                {/* Google Maps */}
                <div className="contact-map" style={{ marginTop: '24px' }}>
                  <iframe
                    title="Mbevha Motors Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3693.5!2d30.4!3d-22.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s195+Mahematshena%2C+Mvelaphanda%2C+Dzwerani!5e0!3m2!1sen!2sza!4v1"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* ── Right: contact form ──────────────────── */}
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
                    <button
                      className="btn btn-outline-red"
                      style={{ marginTop: '24px' }}
                      onClick={() => { setSubmitted(false); setForm(INITIAL); }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form className="contact-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        id="name" name="name" type="text"
                        placeholder="e.g. John Maphosa"
                        value={form.name} onChange={handleChange}
                        aria-invalid={!!errors.name}
                      />
                      {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number *</label>
                      <input
                        id="phone" name="phone" type="tel"
                        placeholder="e.g. 071 234 5678"
                        value={form.phone} onChange={handleChange}
                        aria-invalid={!!errors.phone}
                      />
                      {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Message *</label>
                      <textarea
                        id="message" name="message"
                        placeholder="Tell us about your vehicle and what you need help with…"
                        value={form.message} onChange={handleChange}
                        aria-invalid={!!errors.message}
                        rows={6}
                      />
                      {errors.message && <span className="form-error">{errors.message}</span>}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-full btn-lg"
                      disabled={submitting}
                    >
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
                      <a href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer"
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
