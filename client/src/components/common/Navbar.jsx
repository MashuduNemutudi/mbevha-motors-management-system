/**
 * components/common/Navbar.jsx
 * ─────────────────────────────────────────────────────────────
 * Public website navigation bar.
 *
 * Features (Phase 3 — Public Website):
 *   - Mbevha Motors logo / name (left)
 *   - Navigation links: Home, About, Services, Parts, Gallery, Contact
 *   - Responsive: hamburger menu on mobile
 *   - Active link highlight using React Router's NavLink
 *   - Sticky on scroll with shadow
 *   - Call Now + WhatsApp CTA buttons
 *
 * Data: Business phone and WhatsApp number from context or prop
 * ─────────────────────────────────────────────────────────────
 * TODO (Phase 3): Build full responsive Navbar component.
 */

import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand">
          <span className="navbar__brand-name">Mbevha Motors</span>
        </NavLink>
        <nav className="navbar__links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/parts">Parts</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
