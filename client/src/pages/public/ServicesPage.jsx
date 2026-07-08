import { Link } from 'react-router-dom';
import { useBusiness, toWaNumber } from '../../context/BusinessContext';
import PageBanner  from '../../components/common/PageBanner';
import SectionTitle from '../../components/common/SectionTitle';

const SERVICES = [
  {
    icon: '🔧', title: 'Mechanical Repairs',
    description: 'Comprehensive mechanical repairs for all vehicle makes and models. From minor fixes to complex faults, our technicians handle it all with precision.',
    highlights: ['Engine diagnostics', 'Cooling system repairs', 'Timing belt & chain', 'Oil & fluid leaks'],
  },
  {
    icon: '🛢️', title: 'Vehicle Servicing',
    description: 'Full vehicle service packages to keep your car running at its best. We follow manufacturer specifications to protect your investment and extend engine life.',
    highlights: ['Full & interim services', 'Oil & filter changes', 'Spark plugs & belts', 'Multi-point inspection'],
  },
  {
    icon: '💻', title: 'Diagnostics',
    description: 'Professional vehicle diagnostics using modern equipment. We read fault codes, analyse live data, and identify the root cause before any work begins.',
    highlights: ['OBD fault code reading', 'Live data analysis', 'ABS / SRS / DSC systems', 'BMW-specific diagnostics'],
  },
  {
    icon: '🚗', title: 'Suspension Repairs',
    description: 'Restore ride quality and handling precision with our expert suspension repairs. We inspect and replace worn components to manufacturer specification.',
    highlights: ['Shock absorbers', 'Control arms & ball joints', 'Tie rods & bushes', 'Wheel bearing replacement'],
  },
  {
    icon: '🛑', title: 'Brake Repairs',
    description: 'Brake safety is non-negotiable. We inspect, service, and replace all brake components using quality parts. Your safety is our priority.',
    highlights: ['Brake pads & discs', 'Caliper service & replacement', 'Brake fluid flush', 'ABS diagnostics'],
  },
  {
    icon: '⚙️', title: 'Engine Repairs',
    description: 'From head gaskets to full rebuilds, our engine repair work is thorough and reliable. We also specialise in engine swaps and conversions.',
    highlights: ['Cylinder head jobs', 'Engine overhauls', 'Engine swaps', 'Engine conversions'],
  },
  {
    icon: '🔄', title: 'Gearbox Repairs',
    description: 'Manual and automatic gearbox repairs, services, and replacements. We have the expertise to diagnose and fix gearbox problems correctly the first time.',
    highlights: ['Gearbox removal & fitting', 'Gearbox oil service', 'Clutch replacement', 'CV joint service'],
  },
  {
    icon: '🛞', title: 'Used Vehicle Parts',
    description: 'Quality tested used parts at competitive prices. We stock a wide range of parts and can source specific items on request.',
    highlights: ['Tested before sale', 'BMW parts in stock', 'Engine & drivetrain parts', 'Suspension & brake parts'],
  },
  {
    icon: '🔨', title: 'Panel Beating',
    description: "Professional panel beating to restore your vehicle's bodywork to its original shape. We work with precision to eliminate dents, creases, and collision damage.",
    highlights: ['Collision damage repair', 'Dent removal', 'Panel straightening', 'Rust repairs'],
  },
  {
    icon: '🎨', title: 'Automotive Painting',
    description: "High-quality automotive painting to match your vehicle's original colour. Our finish work is clean, consistent, and durable.",
    highlights: ['Full vehicle painting', 'Panel painting', 'Colour matching', 'Primer & clear coat'],
  },
];

const ServicesPage = () => {
  const { business } = useBusiness();
  const waHref       = `https://wa.me/${toWaNumber(business.whatsapp_number)}`;
  const phoneHref    = `tel:${(business.phone || '').replace(/\s/g, '')}`;
  const phoneDisplay = business.phone || '071 306 5615';

  return (
    <main>
      <PageBanner
        overline="Our Services"
        title="What We Offer"
        sub="Professional automotive services — from mechanical repairs to panel beating and painting"
        bgImage="/images/gallery/img-interior-bay.jpg"
      />

      {/* ── Service cards grid ─────────────────────────────── */}
      <section className="section">
        <div className="container">
          <SectionTitle
            overline="Full Service Workshop"
            heading="Our Complete Range of Services"
            sub="Every job is carried out by experienced technicians using quality parts and professional tools."
            center
          />
          <div className="services-page-grid">
            {SERVICES.map(s => (
              <div key={s.title} className="service-card service-card--full">
                <div className="service-card__icon">{s.icon}</div>
                <h3 className="service-card__title">{s.title}</h3>
                <p className="service-card__desc">{s.description}</p>
                <ul className="service-card__highlights">
                  {s.highlights.map(h => (
                    <li key={h}><span className="service-card__highlight-dot" />{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BMW specialist section — informational only ────── */}
      <section className="section section--dark">
        <div className="container">
          <div className="bmw-spotlight">
            <div className="bmw-spotlight__content">
              <SectionTitle
                overline="BMW Specialists"
                heading="Your BMW Deserves a Specialist"
                light
              />
              <p style={{ color: 'var(--clr-grey-400)', lineHeight: '1.8', marginBottom: 20, fontSize: 15 }}>
                We have worked on BMW vehicles across every generation — from classic E30 coupes to modern
                turbocharged G-series models. Our technicians have deep hands-on experience with BMW engines,
                transmissions, electronics, and VANOS systems.
              </p>
              <p style={{ color: 'var(--clr-grey-400)', lineHeight: '1.8', fontSize: 15 }}>
                When you bring your BMW to {business.business_name || 'Mbevha Motors'}, you get specialist
                attention at a fraction of the dealership cost — with no compromise on quality or accuracy.
                Describe your problem and we'll diagnose it properly before any work begins.
              </p>
            </div>
            <div className="bmw-spotlight__image">
              <img
                src="/images/gallery/img-interior-bay.jpg"
                alt="Workshop bay with BMW"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section className="section section--alt">
        <div className="container">
          <SectionTitle overline="The Process" heading="How It Works" center />
          <div className="process-steps">
            {[
              { step: '01', icon: '📲', title: 'Contact Us', desc: "Call or WhatsApp us to describe your vehicle issue. We'll advise on next steps and book you in." },
              { step: '02', icon: '🔍', title: 'Diagnosis',  desc: 'We inspect and diagnose thoroughly. You receive a clear, honest quote before we start any work.' },
              { step: '03', icon: '🔧', title: 'Repair',     desc: 'Our technicians carry out the work using quality parts and keep you updated throughout.' },
              { step: '04', icon: '✅', title: 'Collection', desc: 'Your vehicle is road-tested and returned to you in top condition, with everything explained.' },
            ].map(s => (
              <div key={s.step} className="process-step">
                <div className="process-step__number">{s.step}</div>
                <div className="process-step__icon">{s.icon}</div>
                <h3 className="process-step__title">{s.title}</h3>
                <p className="process-step__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Single CTA at the bottom ────────────────────────── */}
      <section className="cta-banner">
        <div className="container cta-banner__content">
          <h2 className="cta-banner__title">Need a Service or Repair?</h2>
          <p className="cta-banner__sub">
            Contact us for an honest assessment and fair quote. No hidden charges.
          </p>
          <div className="cta-banner__actions">
            <a href={phoneHref} className="btn btn-outline-white btn-lg">📞 {phoneDisplay}</a>
            <a
              href={`${waHref}?text=${encodeURIComponent('Hi Mbevha Motors, I need a quote for my vehicle.')}`}
              target="_blank" rel="noreferrer"
              className="btn btn-whatsapp btn-lg"
            >
              📲 Get a Quote
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ServicesPage;
