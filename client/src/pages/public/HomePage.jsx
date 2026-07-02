/**
 * pages/public/HomePage.jsx
 * ─────────────────────────────────────────────────────────────
 * Public home page — the main landing page of the website.
 *
 * Sections (to be built in Phase 3 — Public Website):
 *   - HeroSection      : Full-width banner with CTA buttons
 *   - AboutSection     : Brief workshop intro
 *   - ServicesSection  : Service cards
 *   - FeaturedParts    : 3–4 highlighted used parts
 *   - GalleryPreview   : Gallery thumbnail strip
 *   - ContactSection   : Contact form + map
 *
 * Data fetching:
 *   - Business info  → GET /api/business
 *   - Featured parts → GET /api/parts?limit=4&available=true
 *   - Gallery preview→ GET /api/gallery?limit=6
 * ─────────────────────────────────────────────────────────────
 * TODO (Phase 3): Build all sections and wire up API calls.
 */

const HomePage = () => {
  return (
    <main>
      <section style={{ padding: '120px 24px', textAlign: 'center' }}>
        <h1>Mbevha Motors (Pty) Ltd</h1>
        <p style={{ marginTop: 16, color: '#6c757d' }}>
          Your Trusted Automotive Partner in Limpopo
        </p>
        <p style={{ marginTop: 8, color: '#adb5bd', fontSize: 14 }}>
          — Home page coming in Phase 3 —
        </p>
      </section>
    </main>
  );
};

export default HomePage;
