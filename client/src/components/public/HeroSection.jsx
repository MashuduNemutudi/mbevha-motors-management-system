/**
 * components/public/HeroSection.jsx
 * ─────────────────────────────────────────────────────────────
 * Full-width hero banner for the Home page.
 *
 * Content (Phase 3):
 *   - Background image (workshop photo)
 *   - Business name headline
 *   - Tagline / motto
 *   - CTA buttons: Call Now, WhatsApp, Contact Us
 *
 * TODO (Phase 3): Build hero with background image and CTAs.
 */

const HeroSection = ({ businessName, motto, phone, whatsapp }) => (
  <section className="hero">
    <div className="container hero__content">
      <h1 className="hero__title">{businessName || 'Mbevha Motors'}</h1>
      <p className="hero__subtitle">{motto || 'Your Trusted Automotive Partner'}</p>
    </div>
  </section>
);

export default HeroSection;
