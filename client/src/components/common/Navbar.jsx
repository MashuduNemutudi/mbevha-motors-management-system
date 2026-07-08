import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useBusiness, toWaNumber } from '../../context/BusinessContext';

const Navbar = () => {
  const { business } = useBusiness();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const waHref = `https://wa.me/${toWaNumber(business.whatsapp_number)}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setMenuOpen(false);

  const links = [
    { to: '/',         label: 'Home',      end: true },
    { to: '/about',    label: 'About'             },
    { to: '/services', label: 'Services'          },
    { to: '/parts',    label: 'Used Parts'        },
    { to: '/gallery',  label: 'Gallery'           },
    { to: '/contact',  label: 'Contact'           },
  ];

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" onClick={close}>
          <div className="navbar__logo-icon">MM</div>
          <div className="navbar__logo-text">
            <span className="navbar__logo-name">
              {business.business_name || 'Mbevha Motors'}
            </span>
            <span className="navbar__logo-sub">Pty Ltd</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="navbar__links">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}>{l.label}</NavLink>
          ))}
          <NavLink to="/admin/login" className="navbar__admin-link">Admin</NavLink>
        </div>

        {/* Desktop CTA */}
        <div className="navbar__cta">
          <a href={waHref} target="_blank" rel="noreferrer"
             className="btn btn-primary btn-sm">
            📲 WhatsApp
          </a>
        </div>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? ' navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`navbar__mobile${menuOpen ? ' navbar__mobile--open' : ''}`}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end} onClick={close}>{l.label}</NavLink>
        ))}
        <NavLink to="/admin/login" onClick={close}
          style={{ fontSize: '12px', color: '#888' }}>
          Admin Login
        </NavLink>
        <div className="navbar__mobile-cta">
          <a href={waHref} target="_blank" rel="noreferrer"
             className="btn btn-whatsapp btn-full" onClick={close}>
            📲 WhatsApp Us
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
