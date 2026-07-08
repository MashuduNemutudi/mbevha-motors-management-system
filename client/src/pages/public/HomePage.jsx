import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBusiness, toWaNumber } from '../../context/BusinessContext';
import { getPartsApi } from '../../api/partsApi';
import SectionTitle from '../../components/common/SectionTitle';
import ServiceCard  from '../../components/public/ServiceCard';
import PartCard     from '../../components/public/PartCard';
import GalleryGrid  from '../../components/public/GalleryGrid';
import Spinner      from '../../components/common/Spinner';

const UPLOADS_BASE = import.meta.env.VITE_API_URL || '';

/* Service preview cards — strategic 6-item sample */
const SERVICES_PREVIEW = [
  { icon: '🔧', title: 'Mechanical Repairs',  description: 'Comprehensive repairs for all makes and models. Engine, gearbox, cooling, electrics — handled with precision.' },
  { icon: '🏎️', title: 'BMW Specialists',     description: 'Deep expertise in BMW diagnostics and repairs across all generations — E-series, F-series, and G-series.' },
  { icon: '⚙️', title: 'Engine Repairs',      description: 'Engine overhauls, cylinder head jobs, engine swaps, and full conversions — executed by experienced technicians.' },
  { icon: '🛑', title: 'Brake Repairs',       description: 'Complete brake system inspections and repairs. Safety-critical work done to manufacturer specifications.' },
  { icon: '🔨', title: 'Panel Beating',       description: 'Professional bodywork restoration — dent removal, panel straightening, and collision damage repair.' },
  { icon: '🎨', title: 'Automotive Painting', description: 'High-quality spray painting with accurate colour matching, from single panels to full vehicle repaints.' },
];

/* Static gallery preview using local /public images — always available */
const GALLERY_PREVIEW = [
  { src: '/images/gallery/img-brand-sign.jpg',     caption: 'Mbevha Motors' },
  { src: '/images/gallery/img-entrance-close.jpg', caption: 'Our Workshop'  },
  { src: '/images/gallery/img-interior-bay.jpg',   caption: 'Workshop Bay'  },
  { src: '/images/gallery/img-exterior-wide.jpg',  caption: 'Our Premises'  },
];

const WHY_ITEMS = [
  { icon: '🏆', title: 'BMW Specialists',     desc: 'In-depth expertise in all BMW models from E-series classics to modern turbocharged G-series.' },
  { icon: '🔍', title: 'Honest Diagnostics',  desc: 'We tell you exactly what your vehicle needs — nothing more, nothing less.' },
  { icon: '💰', title: 'Competitive Pricing', desc: 'Dealership-quality work at workshop prices. Fair, transparent quoting every time.' },
  { icon: '📍', title: 'Community First',     desc: 'Proudly serving Dzwerani and the greater Vuwani community since our founding.' },
];

const HomePage = () => {
  const { business } = useBusiness();
  const waHref       = `https://wa.me/${toWaNumber(business.whatsapp_number)}`;
  const phoneHref    = `tel:${(business.phone || '').replace(/\s/g, '')}`;
  const phoneDisplay = business.phone || '071 306 5615';

  /* Fetch live parts from API — show top 6 available */
  const [featuredParts, setFeaturedParts]   = useState([]);
  const [partsLoading, setPartsLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res  = await getPartsApi({ available: 'true' });
        const data = (res.data.data || []).slice(0, 6).map(p => ({
          ...p,
          image:     p.image_url ? `${UPLOADS_BASE}/uploads/parts/${p.image_url}` : null,
          available: p.is_available,
          brand:     p.brand || '',
          condition: p.condition || 'Used',
        }));
        setFeaturedParts(data);
      } catch {
        // Silently fail — parts preview is non-critical
      } finally {
        setPartsLoading(false);
      }
    })();
  }, []);

  return (
    <main>
      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg"
             style={{ backgroundImage: "url('/images/gallery/img-entrance-close.jpg')" }} />
        <div className="hero__overlay" />
        <div className="container hero__content">
          <div className="hero__overline">
            <span className="hero__overline-line" />
            {business.business_name || 'Mbevha Motors (Pty) Ltd'} — Dzwerani, Limpopo
          </div>
          <h1 className="hero__title">
            Notable Hands,<br /><span>We Do Quality.</span>
          </h1>
          <div className="hero__tags">
            {['Mechanical Repairs', 'BMW Specialists', 'Panel Beating', 'Used Parts'].map(t => (
              <div key={t} className="hero__tag">
                <span className="hero__tag-dot" />{t}
              </div>
            ))}
          </div>
          <div className="hero__actions">
            <a
              href={`${waHref}?text=${encodeURIComponent('Hi Mbevha Motors! I would like to enquire about your services.')}`}
              target="_blank" rel="noreferrer"
              className="btn btn-primary btn-lg"
            >
              📲 WhatsApp Us
            </a>
            <Link to="/services" className="btn btn-outline-white btn-lg">
              View Services →
            </Link>
          </div>
          <div className="hero__stats">
            <div>
              <div className="hero__stat-value">10+</div>
              <div className="hero__stat-label">Years Experience</div>
            </div>
            <div className="hero__stat-divider" />
            <div>
              <div className="hero__stat-value">500+</div>
              <div className="hero__stat-label">Vehicles Repaired</div>
            </div>
            <div className="hero__stat-divider" />
            <div>
              <div className="hero__stat-value">BMW</div>
              <div className="hero__stat-label">Specialists</div>
            </div>
          </div>
        </div>
        <div className="hero__scroll">
          <div className="hero__scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── ABOUT PREVIEW ─────────────────────────────────── */}
      <section className="about-preview">
        <div className="container">
          <div className="about-preview__grid">
            <div className="about-preview__images">
              <img
                src="/images/gallery/img-exterior-wide.jpg"
                alt="Mbevha Motors Workshop"
                className="about-preview__img-main"
                loading="lazy"
              />
              <div className="about-preview__img-badge">
                <div className="about-preview__badge-num">10+</div>
                <div className="about-preview__badge-text">Years of<br />Excellence</div>
              </div>
            </div>
            <div>
              <SectionTitle
                overline="Who We Are"
                heading="Your Trusted Workshop in Limpopo"
                sub={
                  business.about
                    ? business.about.slice(0, 180) + (business.about.length > 180 ? '…' : '')
                    : 'Mbevha Motors is a professional automotive workshop in Dzwerani specialising in mechanical repairs, BMW work, engine conversions, panel beating, painting, and quality used parts.'
                }
              />
              <div className="about-preview__points">
                {[
                  { icon: '🏎️', title: 'BMW Mechanical Expertise',   desc: 'Factory-level knowledge of BMW vehicles across all generations and models.' },
                  { icon: '🔨', title: 'Panel Beating & Painting',    desc: 'Full bodywork restoration and high-quality spray painting to original factory finish.' },
                  { icon: '🛞', title: 'Quality Used Parts',          desc: 'Tested used parts from trusted suppliers at prices that make sense.' },
                ].map(p => (
                  <div key={p.title} className="about-preview__point">
                    <div className="about-preview__point-icon">{p.icon}</div>
                    <div>
                      <div className="about-preview__point-title">{p.title}</div>
                      <div className="about-preview__point-desc">{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/about" className="btn btn-outline-red">Learn More About Us →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES PREVIEW ──────────────────────────────── */}
      <section className="section section--alt">
        <div className="container">
          <SectionTitle
            overline="What We Do"
            heading="Our Services"
            sub="From routine servicing to complex engine builds, panel beating and painting — one workshop, all expertise."
            center
          />
          <div className="services-grid">
            {SERVICES_PREVIEW.map(s => <ServiceCard key={s.title} {...s} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/services" className="btn btn-primary btn-lg">View All Services →</Link>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ─────────────────────────────────── */}
      <section className="section section--dark">
        <div className="container">
          <SectionTitle overline="Why Us" heading="Why Choose Mbevha Motors" center light />
          <div className="why-grid">
            {WHY_ITEMS.map(w => (
              <div key={w.title} className="why-card">
                <div className="why-card__icon">{w.icon}</div>
                <div className="why-card__title">{w.title}</div>
                <div className="why-card__desc">{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PARTS ────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <SectionTitle
            overline="Parts For Sale"
            heading="Featured Parts"
            sub="Quality used parts at competitive prices. Contact us via WhatsApp to enquire about availability."
            center
          />

          {partsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <Spinner size="medium" />
            </div>
          ) : featuredParts.length > 0 ? (
            <div className="parts-grid">
              {featuredParts.map(p => <PartCard key={p.id} part={p} />)}
            </div>
          ) : (
            /* Empty state — admin hasn't added parts yet */
            <div style={{
              background: 'var(--clr-off-white)', borderRadius: 12,
              padding: '48px 24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
              <p style={{ color: 'var(--clr-grey-600)', marginBottom: 20 }}>
                Our parts inventory is being updated. WhatsApp us to ask about a specific part.
              </p>
              <a
                href={`${waHref}?text=${encodeURIComponent('Hi Mbevha Motors, I am looking for a specific part.')}`}
                target="_blank" rel="noreferrer"
                className="btn btn-whatsapp"
              >
                📲 Enquire About Parts
              </a>
            </div>
          )}

          {featuredParts.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link to="/parts" className="btn btn-outline-red btn-lg">Browse All Parts →</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── GALLERY PREVIEW ───────────────────────────────── */}
      <section className="section section--alt">
        <div className="container">
          <SectionTitle overline="Our Workshop" heading="See Us In Action" center />
          <GalleryGrid images={GALLERY_PREVIEW} />
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/gallery" className="btn btn-primary">View Full Gallery →</Link>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section className="cta-banner">
        <div className="container cta-banner__content">
          <h2 className="cta-banner__title">Ready to Book Your Vehicle In?</h2>
          <p className="cta-banner__sub">
            Call us or send a WhatsApp — we'll get back to you promptly.
          </p>
          <div className="cta-banner__actions">
            <a href={phoneHref} className="btn btn-outline-white btn-lg">
              📞 {phoneDisplay}
            </a>
            <a
              href={`${waHref}?text=${encodeURIComponent("Hi Mbevha Motors, I'd like to book my vehicle in.")}`}
              target="_blank" rel="noreferrer"
              className="btn btn-whatsapp btn-lg"
            >
              📲 WhatsApp Now
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
