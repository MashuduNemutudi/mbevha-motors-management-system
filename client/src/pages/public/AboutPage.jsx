import { Link } from 'react-router-dom';
import PageBanner from '../../components/common/PageBanner';
import SectionTitle from '../../components/common/SectionTitle';

const WA = '27713065615';

const VALUES = [
  { icon: '🏆', title: 'Quality First',     desc: 'We never compromise on quality. Every job is done to the highest standard, period.' },
  { icon: '🤝', title: 'Honest Service',    desc: 'Transparent pricing and honest diagnostics. You always know what you are paying for.' },
  { icon: '⚡', title: 'Efficient Turnaround', desc: 'We respect your time. Work is planned and executed to minimise vehicle downtime.' },
  { icon: '📚', title: 'Expertise',         desc: 'Decades of combined mechanical knowledge. BMW-specialist trained technicians.' },
  { icon: '💡', title: 'Innovation',        desc: 'We stay current with modern vehicle technology, diagnostics, and repair techniques.' },
  { icon: '🌍', title: 'Community',         desc: 'Proudly rooted in Dzwerani, Limpopo. We serve our community with pride.' },
];

const AboutPage = () => (
  <main>
    <PageBanner
      overline="About Us"
      title="About Mbevha Motors"
      sub="A trusted name in automotive excellence in Limpopo"
      bgImage="/images/gallery/img-brand-sign.jpg"
    />

    {/* ── WHO WE ARE ──────────────────────────────────────── */}
    <section className="section">
      <div className="container">
        <div className="about-intro-grid">
          <div className="about-images">
            <img
              src="/images/gallery/img-exterior-wide.jpg"
              alt="Mbevha Motors Workshop Exterior"
              className="about-images__main"
              loading="lazy"
            />
            <img
              src="/images/gallery/img-interior-bay.jpg"
              alt="Workshop interior"
              className="about-images__secondary"
              loading="lazy"
            />
            <div className="about-images__badge">
              10+<span className="about-images__badge-sub">Years in<br />Business</span>
            </div>
          </div>

          <div className="about-text">
            <SectionTitle overline="Who We Are" heading="Notable Hands, We Do Quality" />
            <p className="about-text__lead">
              Mbevha Motors (Pty) Ltd is a professional automotive workshop based in Dzwerani, Limpopo,
              founded on the belief that every vehicle deserves expert care and every customer deserves honest service.
            </p>
            <p>
              What started as a passion for mechanics has grown into a fully equipped workshop trusted by
              vehicle owners across the Vuwani area and beyond. Our team brings together years of
              hands-on experience with a genuine commitment to getting things right the first time.
            </p>
            <p>
              We are proud BMW mechanical specialists — one of the few workshops in the region with
              deep expertise in BMW diagnostics, repairs, and engine work across all generations of BMW vehicles.
              From the classic E-series to modern F and G-series, we know these machines inside and out.
            </p>
            <p>
              Beyond BMWs, we service all makes and models — offering full mechanical repairs, vehicle
              servicing, brake and suspension work, engine swaps and conversions, and a constantly
              updated inventory of quality used parts at competitive prices.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* ── WHAT WE DO ──────────────────────────────────────── */}
    <section className="section section--alt">
      <div className="container">
        <SectionTitle
          overline="Our Expertise"
          heading="What We Do"
          sub="A comprehensive range of automotive services under one roof."
          center
        />
        <div className="about-pillars">
          {[
            { icon: '🔧', title: 'General Workshop', desc: 'Full mechanical repairs for all vehicle makes and models — from routine fixes to complex mechanical faults.' },
            { icon: '🏎️', title: 'BMW Experience', desc: 'Specialised BMW diagnostic and repair capability developed over many years working on these precision German vehicles.' },
            { icon: '⚙️', title: 'Engine Conversions', desc: 'Complete engine conversion planning and installation. We source, prepare, and install with expert precision.' },
            { icon: '🔄', title: 'Engine Swaps', desc: 'Full engine swap services — planned, sourced, and completed in-house by experienced technicians.' },
            { icon: '🛢️', title: 'Vehicle Servicing', desc: 'Comprehensive service packages to keep your vehicle running at its best and maintain its longevity.' },
            { icon: '🛞', title: 'Used Parts Sales', desc: 'Tested, quality used parts sold directly from our workshop. Always at competitive prices.' },
          ].map(p => (
            <div key={p.title} className="about-pillar">
              <div className="about-pillar__icon">{p.icon}</div>
              <div className="about-pillar__title">{p.title}</div>
              <p className="about-pillar__text">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── MISSION / VISION ────────────────────────────────── */}
    <section className="section">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '64px' }}>
          <div style={{ background: 'var(--clr-darker)', borderRadius: '12px', padding: '40px', color: '#fff' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎯</div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px', color: '#fff' }}>Our Mission</h3>
            <p style={{ color: 'var(--clr-grey-400)', lineHeight: '1.8', fontSize: '15px' }}>
              To deliver honest, expert automotive services that our customers in Limpopo can rely on —
              at fair prices, with quality workmanship, and without compromise. We exist to keep
              your vehicle on the road safely and efficiently.
            </p>
          </div>
          <div style={{ background: 'var(--clr-red)', borderRadius: '12px', padding: '40px', color: '#fff' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚀</div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px', color: '#fff' }}>Our Vision</h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: '1.8', fontSize: '15px' }}>
              To become the most trusted and respected automotive workshop in Limpopo — known for
              our BMW expertise, our quality used parts, and our unwavering commitment to every
              customer who drives through our gate.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <SectionTitle overline="Our Values" heading="What We Stand For" center />
        <div className="about-values" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {VALUES.map(v => (
            <div key={v.title} className="about-value">
              <div className="about-value__icon">{v.icon}</div>
              <div>
                <div className="about-value__title">{v.title}</div>
                <div className="about-value__desc">{v.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA ─────────────────────────────────────────────── */}
    <section className="cta-banner">
      <div className="container cta-banner__content">
        <h2 className="cta-banner__title">Come Visit Our Workshop</h2>
        <p className="cta-banner__sub">Dzwerani, Mahematshena, Vuwani Road — Opposite Mavikos</p>
        <div className="cta-banner__actions">
          <a href="tel:0713065615" className="btn btn-outline-white btn-lg">📞 071 306 5615</a>
          <Link to="/contact" className="btn btn-whatsapp btn-lg">Get Directions →</Link>
        </div>
      </div>
    </section>
  </main>
);

export default AboutPage;
