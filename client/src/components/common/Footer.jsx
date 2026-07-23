import { Link } from 'react-router-dom';
import { useBusiness, toWaNumber } from '../../context/BusinessContext';

/* Parse "Mon–Fri: 07:30–17:00 | Sat: 08:00–13:00 | Sun: Closed"
   into an array of { day, time } objects for display */
const parseHours = (raw) =>
  (raw || '').split('|').map(seg => {
    const trimmed = seg.trim();
    const colon   = trimmed.indexOf(':');
    if (colon === -1) return { day: trimmed, time: 'Closed' };
    return {
      day:  trimmed.slice(0, colon).trim(),
      time: trimmed.slice(colon + 1).trim(),
    };
  }).filter(r => r.day);

const Footer = () => {
  const { business } = useBusiness();
  const waHref       = `https://wa.me/${toWaNumber(business.whatsapp_number)}`;
  const phoneDisplay = business.phone || '071 306 5615';
  const phoneHref    = `tel:${(business.phone || '').replace(/\s/g, '')}`;
  const hoursRows    = parseHours(business.opening_hours);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">

          {/* Brand */}
          <div>
            <div className="footer__brand-name">
              {business.business_name || 'Mbevha Motors'}
            </div>
            <div className="footer__brand-slogan">
              "{business.motto || 'Notable Hands, We Do Quality.'}"
            </div>
            <p className="footer__brand-desc">
              {business.about
                ? business.about.length > 180
                  ? business.about.slice(0, 177) + '…'
                  : business.about
                : 'Mbevha Motors (Pty) Ltd is a trusted automotive workshop in Dzwerani, Limpopo. Specialists in BMW mechanical repairs, engine swaps, vehicle servicing, and quality used parts.'
              }
            </p>
            <a href={waHref} target="_blank" rel="noreferrer"
               className="btn btn-whatsapp btn-sm">
              📲 WhatsApp Us
            </a>
            <div className="footer__social">
              <a href="https://tiktok.com" target="_blank" rel="noreferrer"
                 className="footer__social-link" title="TikTok">
                ♪
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <div className="footer__heading">Quick Links</div>
            <ul className="footer__links">
              {[
                ['/', 'Home'], ['/about', 'About Us'], ['/services', 'Our Services'],
                ['/parts', 'Used Parts'], ['/gallery', 'Gallery'], ['/contact', 'Contact'],
              ].map(([to, label]) => (
                <li key={to}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="footer__heading">Contact</div>

            <div className="footer__contact-item">
              <span className="footer__contact-icon">📞</span>
              <div className="footer__contact-text">
                <strong>Phone</strong>
                <a href={phoneHref}>{phoneDisplay}</a>
              </div>
            </div>

            {business.whatsapp_number && (
              <div className="footer__contact-item">
                <span className="footer__contact-icon">📲</span>
                <div className="footer__contact-text">
                  <strong>WhatsApp</strong>
                  <a href={waHref} target="_blank" rel="noreferrer">
                    {business.whatsapp_number}
                  </a>
                </div>
              </div>
            )}

            {business.address && (
              <div className="footer__contact-item">
                <span className="footer__contact-icon">📍</span>
                <div className="footer__contact-text">
                  <strong>Address</strong>
                  {(business.address || '').split(',').map((line, i) => (
                    <span key={i} style={{ display: 'block' }}>{line.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {business.email && (
              <div className="footer__contact-item">
                <span className="footer__contact-icon">✉️</span>
                <div className="footer__contact-text">
                  <strong>Email</strong>
                  <a href={`mailto:${business.email}`}>{business.email}</a>
                </div>
              </div>
            )}
          </div>

          {/* Hours */}
          <div>
            <div className="footer__heading">Working Hours</div>
            {hoursRows.length > 0
              ? hoursRows.map((row, i) => (
                  <div key={i} className="footer__hours-row">
                    <span className="footer__hours-day">{row.day}</span>
                    <span className={
                      row.time.toLowerCase() === 'closed'
                        ? 'footer__hours-closed'
                        : 'footer__hours-time'
                    }>
                      {row.time}
                    </span>
                  </div>
                ))
              : <p style={{ fontSize: '13px', color: '#888' }}>
                  {business.opening_hours || 'Contact us for hours'}
                </p>
            }
          </div>

        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <span className="footer__copy">
            &copy; {new Date().getFullYear()}{' '}
            {business.business_name || 'Mbevha Motors (Pty) Ltd'}. All rights reserved.
          </span>
          <span className="footer__bottom-right">Dzwerani, Limpopo, South Africa</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
