import { Link } from 'react-router-dom';
import { useBusiness, toWaNumber } from '../../context/BusinessContext';
import PageBanner  from '../../components/common/PageBanner';
import SectionTitle from '../../components/common/SectionTitle';

const SERVICES = [
  {
    icon: '🔧', title: 'General Mechanical Repairs',
    description: 'From misfires and oil leaks to complex fault diagnosis — we repair all makes and models with precision. No job is too big or too small for our experienced team.',
    highlights: ['Engine diagnostics', 'Cooling system repairs', 'Timing belt & chain', 'Oil & fluid leaks'],
  },
  {
    icon: '🛢️', title: 'Vehicle Servicing',
    description: 'Keep your vehicle running at peak performance with our comprehensive service packages. We follow manufacturer specifications to protect your investment.',
    highlights: ['Full & interim services', 'Oil & filter changes', 'Spark plugs & belts', 'Multi-point inspection'],
  },
  {
    icon: '🏎️', title: 'BMW Mechanical Repairs',
    description: 'Deep BMW expertise across all generations — E30 through to modern G-series. We treat your BMW with the specialist attention it deserves, at workshop prices.',
    highlights: ['All BMW models', 'E30 / E36 / E46 / E90', 'F & G-series', 'VANOS & valve train'],
  },
  {
    icon: '💻', title: 'BMW Diagnostics',
    description: 'Professional BMW fault code reading, live data analysis, and system diagnostics. We get to the root cause — not just clear the warning light.',
    highlights: ['OBD fault reading', 'Live data analysis', 'ABS / SRS / DSC', 'Adaptations & coding'],
  },
  {
    icon: '🔄', title: 'Engine Swaps',
    description: 'Complete engine swap services handled in-house. We source the engine, prepare the vehicle, manage the installation, and ensure everything is tuned correctly before handover.',
    highlights: ['Engine sourcing', 'Full installation', 'Wiring & ECU', 'Post-swap testing'],
  },
  {
    icon: '⚙️', title: 'Engine Conversions',
    description: 'Want to run a different engine in your vehicle? Our engine conversion builds are meticulously planned and expertly executed — from mounts and wiring to final tuning.',
    highlights: ['Conversion planning', 'Custom mounts', 'Wiring harness', 'Dyno-ready setup'],
  },
  {
    icon: '🛑', title: 'Brake Repairs',
    description: 'Brakes are non-negotiable. We inspect, service, and replace all brake system components to manufacturer specification. Your safety is our priority.',
    highlights: ['Brake pads & discs', 'Caliper service', 'Brake fluid flush', 'ABS diagnostics'],
  },
  {
    icon: '🚗', title: 'Suspension Repairs',
    description: "Poor handling, uneven tyre wear, or a harsh ride — our suspension repairs restore your vehicle's ride quality and handling precision.",
    highlights: ['Shock absorbers', 'Control arms & ball joints', 'Wheel alignment prep', 'Tie rods & bushes'],
  },
  {
    icon: '🛞', title: 'Used Parts Sales',
    description: 'Quality tested used parts at competitive prices. We stock a wide range of parts for common vehicles and can source specific items on request.',
    highlights: ['Tested before sale', 'BMW parts stocked', 'Competitive pricing', 'WhatsApp enquiries'],
  },
];

const ServicesPage = () => {
  const { business } = useBusiness();
  const waHref    = `https://wa.me/${toWaNumber(business.whatsapp_number)}`;
  const phoneHref = `tel:${(business.phone || '').replace(/\s/g, '')}`;
  const phoneDisplay = business.phone || '071 306 5615';

  return (
    <main>
      <PageBanner
        overline="Our Services"
        title="What We Offer"
        sub="Professional automotive services for all makes — with specialist expertise in BMW"
        bgImage="/images/gallery/img-interior-bay.jpg"
      />

      <section className="section">
        <div className="container">
          <SectionTitle
            overline="Full Service Workshop" heading="Our Complete Range of Services"
            sub="Every service is carried out by experienced technicians using quality parts and professional equipment."
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

      {/* BMW Spotlight */}
      <section className="section section--dark">
        <div className="container">
          <div className="bmw-spotlight">
            <div className="bmw-spotlight__content">
              <SectionTitle overline="BMW Specialists" heading="Your BMW Deserves a Specialist" light />
              <p style={{ color: 'var(--clr-grey-400)', lineHeight: '1.8', marginBottom: '32px', fontSize: '15px' }}>
                We have worked on BMW vehicles across every generation — from classic E30 coupes to modern turbocharged G-series models.
                Our technicians have hands-on experience with BMW engines, transmissions, electronics, and VANOS systems.
              </p>
              <p style={{ color: 'var(--clr-grey-400)', lineHeight: '1.8', marginBottom: '40px', fontSize: '15px' }}>
                When you bring your BMW to {business.business_name || 'Mbevha Motors'}, you get specialist attention at a fraction of the dealership cost — without compromising on quality or accuracy.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <a href={`${waHref}?text=${encodeURIComponent('Hi Mbevha Motors, I need help with my BMW.')}`}
                   target="_blank" rel="noreferrer" className="btn btn-primary btn-lg">
                  📲 WhatsApp About Your BMW
                </a>
                <a href={phoneHref} className="btn btn-outline-white btn-lg">
                  📞 {phoneDisplay}
                </a>
              </div>
            </div>
            <div className="bmw-spotlight__image">
              <img src="/images/gallery/img-interior-bay.jpg" alt="BMW in workshop bay" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section section--alt">
        <div className="container">
          <SectionTitle overline="The Process" heading="How It Works" center />
          <div className="process-steps">
            {[
              { step: '01', icon: '📲', title: 'Contact Us',  desc: "Call or WhatsApp us to describe your vehicle issue. We'll advise you on next steps and book you in." },
              { step: '02', icon: '🔍', title: 'Diagnosis',   desc: 'We inspect and diagnose the problem thoroughly. You receive a clear, honest quotation before we start any work.' },
              { step: '03', icon: '🔧', title: 'Repair',      desc: 'Our technicians carry out the work using quality parts. We keep you updated throughout the process.' },
              { step: '04', icon: '✅', title: 'Collection',  desc: 'Your vehicle is road-tested and handed back to you in top condition, with everything explained clearly.' },
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

      <section className="cta-banner">
        <div className="container cta-banner__content">
          <h2 className="cta-banner__title">Need a Service or Repair?</h2>
          <p className="cta-banner__sub">Contact us today for a free diagnostic assessment and honest quote.</p>
          <div className="cta-banner__actions">
            <a href={phoneHref} className="btn btn-outline-white btn-lg">📞 {phoneDisplay}</a>
            <a href={`${waHref}?text=${encodeURIComponent('Hi Mbevha Motors, I need a quote for my vehicle.')}`}
               target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-lg">
              📲 Get a Quote
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ServicesPage;
