/**
 * pages/public/ContactPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Public Contact page.
 *
 * Content (Phase 3):
 *   - Contact form: Name, Phone, Vehicle (optional), Message
 *   - Business contact details: phone, email, address, hours
 *   - WhatsApp button
 *   - Google Maps embed iframe
 *
 * Data:
 *   - GET  /api/business  (phone, email, address, hours, maps)
 *   - POST /api/messages  (contact form submission)
 *     └ Rate limited: 10 submissions / 15 min per IP
 * ─────────────────────────────────────────────────────────────
 * TODO (Phase 3): Build ContactForm component and page layout.
 */

const ContactPage = () => (
  <main style={{ padding: '80px 24px', textAlign: 'center' }}>
    <h1>Contact Us</h1>
    <p style={{ marginTop: 8, color: '#adb5bd', fontSize: 14 }}>— Coming in Phase 3 —</p>
  </main>
);

export default ContactPage;
