import { Link } from 'react-router-dom';
import { useBusiness, toWaNumber } from '../../context/BusinessContext';
import SectionTitle  from '../../components/common/SectionTitle';
import ServiceCard   from '../../components/public/ServiceCard';
import PartCard      from '../../components/public/PartCard';
import GalleryGrid   from '../../components/public/GalleryGrid';

const SERVICES_PREVIEW = [
  { icon: '🔧', title: 'General Mechanical Repairs',  description: 'Comprehensive mechanical repairs for all vehicle makes and models. Engine, gearbox, drivetrain — handled with precision.' },
  { icon: '🏎️', title: 'BMW Specialists',             description: 'Specialist knowledge in BMW mechanical repairs and diagnostics. We understand your BMW better than most.' },
  { icon: '⚙️', title: 'Engine Swaps & Conversions',  description: 'Expert engine swap and conversion services. Quality workmanship on every build, every time.' },
  { icon: '🛢️', title: 'Vehicle Servicing',           description: 'Full vehicle service packages — oil changes, filters, brakes, tyres — keeping your vehicle in peak condition.' },
  { icon: '🔩', title: 'Brake & Suspension',          description: 'Safety-critical brake and suspension repairs performed to manufacturer specifications by skilled technicians.' },
  { icon: '🛞', title: 'Used Parts Sales',            description: 'Quality used vehicle parts at competitive prices. Tested, reliable parts from our extensive inventory.' },
];

const PARTS_PREVIEW = [
  { id: 1, name: 'Engine Mounting',  brand: '',  category: 'Mountings',  condition: 'Used',  price: 600,   available: true,  image: null },
  { id: 2, name: 'Gearbox Mounting', brand: '',  category: 'Mountings',  condition: 'Used',  price: 400,   available: true,  image: null },
  { id: 3, name: 'Water Pump',       brand: '',  category: 'Cooling',    condition: 'Used',  price: 1200,  available: true,  image: null },
  { id: 4, name: 'Thermostat',       brand: '',  category: 'Cooling',    condition: 'Used',  price: 1200,  available: true,  image: null },
  { id: 5, name: 'Brake Disc',       brand: '',  category: 'Brakes',     condition: 'Used',  price: 400,   available: true,  image: null },
  { id: 6, name: 'Control Arm',      brand: '',  category: 'Suspension', condition: 'Used',  price: 600,   available: true,  image: null },
];

const GALLERY_PREVIEW = [
  { src: '/images/gallery/img-brand-sign.jpg',     caption: 'Mbevha Motors' },
  { src: '/images/gallery/img-entrance-close.jpg', caption: 'Our Workshop'  },
  { src: '/images/gallery/img-interior-bay.jpg',   caption: 'Workshop Bay'  },
  { src: '/images/gallery/img-exterior-wide.jpg',  caption: 'Our Premises'  },
];

const WHY_ITEMS = [
  { icon: '🏆', title: 'BMW Specialists',      desc: 'In-depth expertise in all BMW models, from E-series to modern F and G-series.' },
  { icon: '🔍', title: 'Honest Diagnostics',   desc: 'We tell you exactly what your vehicle needs — nothing more, nothing less.' },
  { icon: '💰', title: 'Competitive Pricing',  desc: 'Dealership-quality work at workshop prices. Fair and transparent quoting.' },
  { icon: '📍', title: 'Community First',      desc: 'Proudly serving Dzwerani and the greater Vuwani community since our founding.' },
];

const HomePage = () => {
  const { business } = useBusiness();
  const waHref = `https://wa.me/${toWaNumber(business.whatsapp_number)}`;
  const phoneDisplay = business.phone || '071 306 5615';
  const phoneHref    = `tel:${(business.phone || '').replace(/\s/g, '')}`;

  return (
    <main>
      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg" style={{ backgroundImage: "url('/images/gallery/img-entrance-close.jpg')" }} />
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
            {['General Automotive Repairs', 'BMW Specialists', 'Engine Swaps', 'Used Parts'].map(t => (
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
              <img src="/images/gallery/img-exterior-wide.jpg" alt="Mbevha Motors Workshop"
                   className="about-preview__img-main" loading="lazy" />
              <div className="about-preview__img-badge">
                <div className="about-preview__badge-num">10+</div>
                <div className="about-preview__badge-text">Years of<br />Excellence</div>
              </div>
            </div>
            <div>
              <SectionTitle
                overline="Who We Are"
                heading="Your Trusted Workshop in Limpopo"
                sub={business.about
                  ? business.about.slice(0, 160) + (business.about.length > 160 ? '…' : '')
                  : 'Mbevha Motors is a professional automotive workshop in Dzwerani, specialising in BMW repairs, engine conversions, and quality used parts.'}
              />
              <div className="about-preview__points">
                {[
                  { icon: '🏎️', title: 'BMW Mechanical Expertise',    desc: 'Factory-level knowledge of BMW vehicles across all generations and models.' },
                  { icon: '⚙️', title: 'Engine Swaps & Conversions',  desc: 'Complete engine swap and conversion builds — planned, sourced, and installed in-house.' },
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
          <SectionTitle overline="What We Do" heading="Our Services"
            sub="From routine servicing to complex engine builds — we handle it all with the same commitment to quality."
            center />
          <div className="services-grid">
            {SERVICES_PREVIEW.map(s => <ServiceCard key={s.title} {...s} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
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
          <SectionTitle overline="Parts For Sale" heading="Featured Parts"
            sub="Quality parts at competitive prices. Contact us via WhatsApp to enquire about availability."
            center />
          <div className="parts-grid">
            {PARTS_PREVIEW.map(p => <PartCard key={p.id} part={p} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/parts" className="btn btn-outline-red btn-lg">Browse All Parts →</Link>
          </div>
        </div>
      </section>

      {/* ── GALLERY PREVIEW ───────────────────────────────── */}
      <section className="section section--alt">
        <div className="container">
          <SectionTitle overline="Our Workshop" heading="See Us In Action" center />
          <GalleryGrid images={GALLERY_PREVIEW} />
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link to="/gallery" className="btn btn-primary">View Full Gallery →</Link>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section className="cta-banner">
        <div className="container cta-banner__content">
          <h2 className="cta-banner__title">Ready to Book Your Vehicle In?</h2>
          <p className="cta-banner__sub">
            Call us or send a WhatsApp message and we'll get back to you promptly.
          </p>
          <div className="cta-banner__actions">
            <a href={phoneHref} className="btn btn-outline-white btn-lg">
              📞 Call {phoneDisplay}
            </a>
            <a href={`${waHref}?text=${encodeURIComponent("Hi Mbevha Motors, I'd like to book my vehicle in.")}`}
               target="_blank" rel="noreferrer"
               className="btn btn-whatsapp btn-lg">
              📲 WhatsApp Now
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
