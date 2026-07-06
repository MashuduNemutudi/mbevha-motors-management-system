import { Link } from 'react-router-dom';
import PageBanner from '../../components/common/PageBanner';
import SectionTitle from '../../components/common/SectionTitle';

const WA = '27713065615';

const SERVICES = [
  {
    icon: '🔧',
    title: 'General Mechanical Repairs',
    description:
      'From misfires and oil leaks to complex fault diagnosis — we repair all makes and models with precision. No job is too big or too small for our experienced team.',
    highlights: ['Engine diagnostics', 'Cooling system repairs', 'Timing belt & chain', 'Oil & fluid leaks'],
  },
  {
    icon: '🛢️',
    title: 'Vehicle Servicing',
    description:
      'Keep your vehicle running at peak performance with our comprehensive service packages. We follow manufacturer specifications to protect your investment.',
    highlights: ['Full & interim services', 'Oil & filter changes', 'Spark plugs & belts', 'Multi-point inspection'],
  },
  {
    icon: '🏎️',
    title: 'BMW Mechanical Repairs',
    description:
      'Deep BMW expertise across all generations — E30 through to modern G-series. We treat your BMW with the specialist attention it deserves, at workshop prices.',
    highlights: ['All BMW models', 'E30 / E36 / E46 / E90', 'F & G-series', 'VANOS & valve train'],
  },
  {
    icon: '💻',
    title: 'BMW Diagnostics',
    description:
      'Professional BMW fault code reading, live data analysis, and system diagnostics. We get to the root cause — not just clear the warning light.',
    highlights: ['OBD fault reading', 'Live data analysis', 'ABS / SRS / DSC', 'Adaptations & coding'],
  },
  {
    icon: '🔄',
    title: 'Engine Swaps',
    description:
      'Complete engine swap services handled in-house. We source the engine, prepare the vehicle, manage the installation, and ensure everything is tuned correctly before handover.',
    highlights: ['Engine sourcing', 'Full installation', 'Wiring & ECU', 'Post-swap testing'],
  },
  {
    icon: '⚙️',
    title: 'Engine Conversions',
    description:
      'Want to run a different engine in your vehicle? Our engine conversion builds are meticulously planned and expertly executed — from mounts and wiring to final tuning.',
    highlights: ['Conversion planning', 'Custom mounts', 'Wiring harness', 'Dyno-ready setup'],
  },
  {
    icon: '🛑',
    title: 'Brake Repairs',
    description:
      'Brakes are non-negotiable. We inspect, service, and replace all brake system components to manufacturer specification. Your safety is our priority.',
    highlights: ['Brake pads & discs', 'Caliper service', 'Brake fluid flush', 'ABS diagnostics'],
  },
  {
    icon: '🚗',
    title: 'Suspension Repairs',
    description:
      'Poor handling, uneven tyre wear, or a harsh ride — our suspension repairs restore your vehicle\'s ride quality and handling precision.',
    highlights: ['Shock absorbers', 'Control arms & ball joints', 'Wheel alignment prep', 'Tie rods & bushes'],
  },
  {
    icon: '🛞',
    title: 'Used Parts Sales',
    description:
      'Quality tested used parts at competitive prices. We stock a wide range of parts for common vehicles and can source specific items on request.',
    highlights: ['Tested before sale', 'BMW parts stocked', 'Competitive pricing', 'WhatsApp enquiries'],
  },
];

const ServicesPage = () => (
  <main>
    <PageBanner
      overline="Our Services"
      title="What We Offer"
      sub="Professional automotive services for all makes — with specialist expertise in BMW"
      bgImage="/images/gallery/img-interior-bay.jpg"
    />

    {/* ── SERVICES GRID ───────────────────────────────────── */}
    <section className="section">
      <div className="container">
        <SectionTitle
          overline="Full Service Workshop"
          heading="Our Complete Range of Services"
          sub="Every service is carried out by experienced technicians using quality parts and professional equipment."
          center
        />

        <div className="services-page-grid">
          {SERVICES.map((s) => (
            <div key={s.title} className="service-card service-card--full">
              <div className="service-card__icon">{s.icon}</div>
              <h3 className="service-card__title">{s.title}</h3>
              <p className="service-card__desc">{s.description}</p>
              <ul className="service-card__highlights">
                {s.highlights.map((h) => (
                  <li key={h}>
                    <span className="service-card__highlight-dot" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── BMW SPOTLIGHT ────────────────────────────────────── */}
    <section className="section section--dark">
      <div className="container">
        <div className="bmw-spotlight">
          <div className="bmw-spotlight__content">
            <SectionTitle
              overline="BMW Specialists"
              heading="Your BMW Deserves a Specialist"
              light
            />
            <p style={{ color: 'var(--clr-grey-400)', lineHeight: '1.8', marginBottom: '32px', fontSize: '15px' }}>
              We have worked on BMW vehicles across every generation — from classic E30 coupes
              to modern turbocharged G-series models. Our technicians have hands-on experience
              with BMW engines, transmissions, electronics, and VANOS systems that most general
              workshops simply do not have.
            </p>
            <p style={{ color: 'var(--clr-grey-400)', lineHeight: '1.8', marginBottom: '40px', fontSize: '15px' }}>
              When you bring your BMW to Mbevha Motors, you get specialist attention at a
              fraction of the dealership cost — without compromising on quality or accuracy.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a
                href={`https://wa.me/${WA}?text=Hi%20Mbevha%20Motors,%20I%20need%20help%20with%20my%20BMW.`}
                target="_blank" rel="noreferrer"
                className="btn btn-primary btn-lg"
              >
                📲 WhatsApp About Your BMW
              </a>
              <a href="tel:0713065615" className="btn btn-outline-white btn-lg">
                📞 Call Us
              </a>
            </div>
          </div>
          <div className="bmw-spotlight__image">
            <img
              src="/images/gallery/img-interior-bay.jpg"
              alt="BMW in workshop bay"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>

    {/* ── HOW IT WORKS ────────────────────────────────────── */}
    <section className="section section--alt">
      <div className="container">
        <SectionTitle overline="The Process" heading="How It Works" center />
        <div className="process-steps">
          {[
            { step: '01', icon: '📲', title: 'Contact Us', desc: 'Call or WhatsApp us to describe your vehicle issue. We\'ll advise you on next steps and book you in.' },
            { step: '02', icon: '🔍', title: 'Diagnosis', desc: 'We inspect and diagnose the problem thoroughly. You receive a clear, honest quotation before we start any work.' },
            { step: '03', icon: '🔧', title: 'Repair', desc: 'Our technicians carry out the work using quality parts. We keep you updated throughout the process.' },
            { step: '04', icon: '✅', title: 'Collection', desc: 'Your vehicle is road-tested and handed back to you in top condition, with everything explained clearly.' },
          ].map((s) => (
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

    {/* ── PRICE LIST ────────────────────────────────────── */}
    <section className="section">
      <div className="container">
        <SectionTitle
          overline="Price Guide"
          heading="Our Service Price List"
          sub="Below are our standard labour prices. Prices may vary depending on vehicle model and condition."
          center
        />

        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "30px",
            boxShadow: "0 5px 20px rgba(0,0,0,.08)",
          }}
        >
          <h3 style={{ marginBottom: "20px" }}>Engine Services</h3>

          <table className="price-table" style={{ width: "100%", marginBottom: "30px" }}>
            <tbody>
              <tr><td>Engine Overhaul (6/8 Cylinder)</td><td>R4,500</td></tr>
              <tr><td>Engine Overhaul (BMW/Benz/Audi/VW 4 Cylinder)</td><td>R3,000</td></tr>
              <tr><td>Engine Overhaul (Other 4 Cylinder)</td><td>R2,500</td></tr>
              <tr><td>Cylinder Head Job (8 Cylinder)</td><td>R3,500</td></tr>
              <tr><td>Cylinder Head Job (6 Cylinder)</td><td>R2,500</td></tr>
              <tr><td>Cylinder Head Job (4 Cylinder)</td><td>R2,000</td></tr>
              <tr><td>Gearbox Remove</td><td>R1,500</td></tr>
              <tr><td>Engine Service (8/6 Cylinder)</td><td>R1,500</td></tr>
              <tr><td>Engine Service (4 Cylinder)</td><td>R1,200</td></tr>
              <tr><td>Oil Pump Remove</td><td>R800</td></tr>
              <tr><td>Tappet Cover Remove</td><td>R400</td></tr>
              <tr><td>Gearbox Oil Service</td><td>R1,500</td></tr>
              <tr><td>Cooling System Service</td><td>R800</td></tr>
              <tr><td>Propeller Shaft Service</td><td>R800</td></tr>
              <tr><td>Clutch Cylinder Replacement</td><td>R600</td></tr>
              <tr><td>Fuel System Service</td><td>R1,200</td></tr>
              <tr><td>Fuel Pump Replacement</td><td>R800</td></tr>
              <tr><td>Engine Conversion</td><td>R5,500</td></tr>
              <tr><td>Engine Mounting Replacement</td><td>R600</td></tr>
              <tr><td>Gearbox Mounting Replacement</td><td>R400</td></tr>
            </tbody>
          </table>

          <h3 style={{ marginBottom: "20px" }}>Brakes & Suspension</h3>

          <table className="price-table" style={{ width: "100%", marginBottom: "30px" }}>
            <tbody>
              <tr><td>Front Brake Pads Replacement</td><td>R600</td></tr>
              <tr><td>Rear Brake Pads Replacement</td><td>R400</td></tr>
              <tr><td>Brake Shoes Adjustment</td><td>R400</td></tr>
              <tr><td>Brake Shoes Replacement</td><td>R600</td></tr>
              <tr><td>Brake Cylinder Replacement / Service</td><td>R400</td></tr>
              <tr><td>Hand Brake Service</td><td>R400</td></tr>
              <tr><td>Brake Bleeding</td><td>R300</td></tr>
              <tr><td>Front Shock Absorbers Replacement</td><td>R1,000</td></tr>
              <tr><td>Rear Shock Absorbers Replacement</td><td>R800</td></tr>
              <tr><td>Front Shocks Mounting</td><td>R800</td></tr>
              <tr><td>Rear Shocks Mounting</td><td>R600</td></tr>
            </tbody>
          </table>

          <h3 style={{ marginBottom: "20px" }}>Steering & Other Repairs</h3>

          <table className="price-table" style={{ width: "100%" }}>
            <tbody>
              <tr><td>Front Stabilizer Links Replacement</td><td>R400</td></tr>
              <tr><td>Rear Stabilizer Links Replacement</td><td>R400</td></tr>
              <tr><td>Tyre Rod End Replacement</td><td>R400</td></tr>
              <tr><td>Steering Rod Ends Replacement</td><td>R400</td></tr>
              <tr><td>Inner CV Joint Replacement / Service</td><td>R600</td></tr>
              <tr><td>Outer CV Joint Replacement / Service</td><td>R600</td></tr>
              <tr><td>Wheel Bearing Replacement / Service</td><td>R400</td></tr>
              <tr><td>Ball Joint Replacement</td><td>R400</td></tr>
              <tr><td>Control Arm Replacement</td><td>R600</td></tr>
              <tr><td>V-Arm Replacement</td><td>R800</td></tr>
              <tr><td>Steering Rack Replacement</td><td>R1,500</td></tr>
              <tr><td>Brake Disc Replacement</td><td>R400</td></tr>
              <tr><td>Brake Drums Replacement</td><td>R600</td></tr>
              <tr><td>Differential Replacement Fitting</td><td>R1,500</td></tr>
              <tr><td>Thermostat</td><td>R1,200</td></tr>
              <tr><td>Water Pump Service</td><td>R1,200</td></tr>
              <tr><td>Brake Lining</td><td>R600</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    {/* ── CTA ─────────────────────────────────────────────── */}
    <section className="cta-banner">
      <div className="container cta-banner__content">
        <h2 className="cta-banner__title">Need a Service or Repair?</h2>
        <p className="cta-banner__sub">Contact us today for a free diagnostic assessment and honest quote.</p>
        <div className="cta-banner__actions">
          <a href="tel:0713065615" className="btn btn-outline-white btn-lg">📞 071 306 5615</a>
          <a
            href={`https://wa.me/${WA}?text=Hi%20Mbevha%20Motors,%20I%20need%20a%20quote%20for%20my%20vehicle.`}
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

export default ServicesPage;
