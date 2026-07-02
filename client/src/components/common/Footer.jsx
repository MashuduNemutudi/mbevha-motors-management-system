/**
 * components/common/Footer.jsx
 * ─────────────────────────────────────────────────────────────
 * Public website footer.
 *
 * Content (Phase 3):
 *   - Business name and motto
 *   - Quick links column
 *   - Contact details column (phone, email, address, hours)
 *   - Social / WhatsApp link
 *   - Copyright line
 *
 * Data: GET /api/business
 * ─────────────────────────────────────────────────────────────
 * TODO (Phase 3): Build full footer layout.
 */

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p className="footer__copy">
          &copy; {new Date().getFullYear()} Mbevha Motors (Pty) Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
