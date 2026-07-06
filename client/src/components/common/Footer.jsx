import { Link } from 'react-router-dom';

const WA = '27713065615';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer__grid">

        {/* Brand */}
        <div>
          <div className="footer__brand-name">Mbevha Motors</div>
          <div className="footer__brand-slogan">"Notable Hands, We Do Quality."</div>
          <p className="footer__brand-desc">
            Mbevha Motors (Pty) Ltd is a trusted automotive workshop based in Dzwerani, Limpopo.
            Specialists in BMW mechanical repairs, engine swaps, vehicle servicing, and quality used parts.
          </p>
          <a href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer"
             className="btn btn-whatsapp btn-sm">
            📲 WhatsApp Us
          </a>
          <div className="footer__social" style={{ marginTop: '16px' }}>
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
            {[['/', 'Home'], ['/about', 'About Us'], ['/services', 'Our Services'],
              ['/parts', 'Used Parts'], ['/gallery', 'Gallery'], ['/contact', 'Contact']
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
              <a href="tel:0713065615">071 306 5615</a>
            </div>
          </div>
          <div className="footer__contact-item">
            <span className="footer__contact-icon">📍</span>
            <div className="footer__contact-text">
              <strong>Address</strong>
              Dzwerani, Mahematshena<br />
              Vuwani Road<br />
              Opposite Mavikos
            </div>
          </div>
          <div className="footer__contact-item">
            <span className="footer__contact-icon">✉️</span>
            <div className="footer__contact-text">
              <strong>Email</strong>
              info@mbevhamotors.co.za
            </div>
          </div>
        </div>

        {/* Hours */}
        <div>
          <div className="footer__heading">Working Hours</div>
          <div className="footer__hours-row">
            <span className="footer__hours-day">Monday – Friday</span>
            <span className="footer__hours-time">08:00 – 17:00</span>
          </div>
          <div className="footer__hours-row">
            <span className="footer__hours-day">Saturday</span>
            <span className="footer__hours-time">08:00 – 13:00</span>
          </div>
          <div className="footer__hours-row">
            <span className="footer__hours-day">Sunday</span>
            <span className="footer__hours-closed">Closed</span>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <span className="footer__copy">
          &copy; {new Date().getFullYear()} Mbevha Motors (Pty) Ltd. All rights reserved.
        </span>
        <span className="footer__bottom-right">Dzwerani, Limpopo, South Africa</span>
      </div>
    </div>
  </footer>
);

export default Footer;
