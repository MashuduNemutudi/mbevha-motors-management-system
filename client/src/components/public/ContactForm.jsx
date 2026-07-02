/**
 * components/public/ContactForm.jsx
 * ─────────────────────────────────────────────────────────────
 * Public contact / enquiry form.
 *
 * Fields: Name*, Phone*, Vehicle (optional), Message*
 * Submits to: POST /api/messages
 * Rate limited: 10 submissions / 15 min per IP
 *
 * Features (Phase 3):
 *   - Client-side validation before submit
 *   - Loading state on submit button
 *   - Success message after submission
 *   - Error message if submission fails
 *
 * TODO (Phase 3): Build full form with validation and feedback.
 */

const ContactForm = () => (
  <div className="contact-form-placeholder">
    <p>Contact form — coming in Phase 3</p>
  </div>
);

export default ContactForm;
