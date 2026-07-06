import { useState } from 'react';
import PageBanner from '../../components/common/PageBanner';
import SectionTitle from '../../components/common/SectionTitle';
import GalleryGrid from '../../components/public/GalleryGrid';

/* ── All 8 real Mbevha Motors images ───────────────────── */
const ALL_IMAGES = [
  {
    src: '/images/gallery/img-brand-sign.jpg',
    caption: 'Mbevha Motors — Notable Hands, We Do Quality',
    category: 'Branding',
    wide: true,
  },
  {
    src: '/images/gallery/img-entrance-close.jpg',
    caption: 'Our workshop entrance — Dzwerani, Limpopo',
    category: 'Workshop',
  },
  {
    src: '/images/gallery/img-exterior-wide.jpg',
    caption: 'Mbevha Motors premises — Vuwani Road',
    category: 'Workshop',
    wide: true,
  },
  {
    src: '/images/gallery/img-interior-bay.jpg',
    caption: 'Workshop bay — vehicles in for service',
    category: 'Workshop',
  },
  {
    src: '/images/gallery/img-workshop-extra1.jpg',
    caption: 'Workshop operations',
    category: 'Workshop',
  },
  {
    src: '/images/gallery/img-workshop-extra2.jpg',
    caption: 'Professional workshop facilities',
    category: 'Workshop',
  },
  {
    src: '/images/gallery/img-workshop-extra3.jpg',
    caption: 'Our team at work',
    category: 'Workshop',
  },
  {
    src: '/images/gallery/img-workshop-notice.jpg',
    caption: 'Mbevha Motors — workshop signage',
    category: 'Branding',
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(ALL_IMAGES.map(i => i.category)))];

const GalleryPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? ALL_IMAGES
    : ALL_IMAGES.filter(img => img.category === activeCategory);

  return (
    <main>
      <PageBanner
        overline="Gallery"
        title="Our Workshop Gallery"
        sub="A look at our facilities, our team, and the work we do"
        bgImage="/images/gallery/img-brand-sign.jpg"
      />

      <section className="section">
        <div className="container">
          <SectionTitle
            overline="Photo Gallery"
            heading="See Mbevha Motors in Action"
            sub="Click any image to view it in full size. Use the arrow keys or navigation buttons to browse through the gallery."
            center
          />

          {/* Category filter */}
          <div className="parts-filter" style={{ justifyContent: 'center', marginBottom: '40px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`parts-filter__btn${activeCategory === cat ? ' parts-filter__btn--active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery with lightbox */}
          <GalleryGrid
            images={filtered}
            className="gallery-page-grid"
          />

          <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--clr-grey-500)', fontSize: '13px' }}>
            {filtered.length} image{filtered.length !== 1 ? 's' : ''} — click to enlarge
          </p>
        </div>
      </section>

      {/* ── Visit us CTA ─────────────────────────────────── */}
      <section className="cta-banner">
        <div className="container cta-banner__content">
          <h2 className="cta-banner__title">Come See Us In Person</h2>
          <p className="cta-banner__sub">
            Dzwerani, Mahematshena — Vuwani Road, Opposite Mavikos
          </p>
          <div className="cta-banner__actions">
            <a href="tel:0713065615" className="btn btn-outline-white btn-lg">📞 071 306 5615</a>
            <a
              href="https://wa.me/27713065615"
              target="_blank" rel="noreferrer"
              className="btn btn-whatsapp btn-lg"
            >
              📲 WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default GalleryPage;
