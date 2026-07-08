import { useState, useMemo } from 'react';
import { useBusiness, toWaNumber } from '../../context/BusinessContext';
import PageBanner  from '../../components/common/PageBanner';
import SectionTitle from '../../components/common/SectionTitle';
import PartCard    from '../../components/public/PartCard';

/* Sample data — replaced by API in Parts Management phase */
const SAMPLE_PARTS = [
  { id: 1,  name: 'Engine Mounting',           brand: '',           category: 'Mountings',  condition: 'Used', price: 600,   available: true,  image: null },
  { id: 2,  name: 'Gearbox Mounting',          brand: '',           category: 'Mountings',  condition: 'Used', price: 400,   available: true,  image: null },
  { id: 3,  name: 'Brake Disc',                brand: '',           category: 'Brakes',     condition: 'Used', price: 400,   available: true,  image: null },
  { id: 4,  name: 'Brake Drum',                brand: '',           category: 'Brakes',     condition: 'Used', price: 600,   available: true,  image: null },
  { id: 5,  name: 'Wheel Bearing',             brand: '',           category: 'Suspension', condition: 'Used', price: 400,   available: true,  image: null },
  { id: 6,  name: 'Ball Joint',                brand: '',           category: 'Suspension', condition: 'Used', price: 400,   available: true,  image: null },
  { id: 7,  name: 'Control Arm',               brand: '',           category: 'Suspension', condition: 'Used', price: 600,   available: true,  image: null },
  { id: 8,  name: 'V-Arm',                     brand: '',           category: 'Suspension', condition: 'Used', price: 800,   available: true,  image: null },
  { id: 9,  name: 'Tyre Rod End',              brand: '',           category: 'Steering',   condition: 'Used', price: 400,   available: true,  image: null },
  { id: 10, name: 'Steering Rack End',         brand: '',           category: 'Steering',   condition: 'Used', price: 400,   available: true,  image: null },
  { id: 11, name: 'Inner CV Joint',            brand: '',           category: 'Drivetrain', condition: 'Used', price: 600,   available: true,  image: null },
  { id: 12, name: 'Outer CV Joint',            brand: '',           category: 'Drivetrain', condition: 'Used', price: 600,   available: true,  image: null },
  { id: 13, name: 'Water Pump',                brand: '',           category: 'Cooling',    condition: 'Used', price: 1200,  available: true,  image: null },
  { id: 14, name: 'Thermostat',                brand: '',           category: 'Cooling',    condition: 'Used', price: 1200,  available: true,  image: null },
  { id: 15, name: 'BMW E36 M52 Engine',        brand: 'BMW',        category: 'Engine',     condition: 'Used', price: 12000, available: true,  image: null },
  { id: 16, name: 'BMW E46 Cylinder Head',     brand: 'BMW',        category: 'Engine',     condition: 'Reconditioned', price: 5500, available: true, image: null },
  { id: 17, name: 'BMW E90 Steering Rack',     brand: 'BMW',        category: 'Steering',   condition: 'Used', price: 2800,  available: true,  image: null },
  { id: 18, name: 'VW Polo 1.4 Gearbox',      brand: 'Volkswagen', category: 'Drivetrain', condition: 'Used', price: 3500,  available: false, image: null },
];

const CATEGORIES = ['All', ...Array.from(new Set(SAMPLE_PARTS.map(p => p.category))).sort()];

const PartsPage = () => {
  const { business } = useBusiness();
  const waHref    = `https://wa.me/${toWaNumber(business.whatsapp_number)}`;
  const phoneHref = `tel:${(business.phone || '').replace(/\s/g, '')}`;
  const phoneDisplay = business.phone || '071 306 5615';

  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch]                 = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filtered = useMemo(() =>
    SAMPLE_PARTS.filter(p => {
      const matchCat    = activeCategory === 'All' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.brand.toLowerCase().includes(search.toLowerCase());
      const matchAvail  = !showAvailableOnly || p.available;
      return matchCat && matchSearch && matchAvail;
    }),
    [activeCategory, search, showAvailableOnly]
  );

  return (
    <main>
      <PageBanner overline="Used Parts" title="Quality Used Parts"
        sub="Tested, priced fairly, and ready to fit — enquire via WhatsApp"
        bgImage="/images/gallery/img-workshop-extra2.jpg" />

      <section className="section">
        <div className="container">
          <SectionTitle overline="Parts Inventory" heading="Browse Our Used Parts"
            sub="We stock a wide range of used vehicle parts. All parts are tested before sale. Contact us on WhatsApp to confirm availability before visiting."
            center />

          <div className="parts-controls">
            <div className="parts-search">
              <span className="parts-search__icon">🔍</span>
              <input type="text" placeholder="Search by part name or brand…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="parts-search__input" />
              {search && <button className="parts-search__clear" onClick={() => setSearch('')}>✕</button>}
            </div>
            <label className="parts-avail-toggle">
              <input type="checkbox" checked={showAvailableOnly}
                onChange={e => setShowAvailableOnly(e.target.checked)} />
              <span>Available only</span>
            </label>
          </div>

          <div className="parts-filter">
            {CATEGORIES.map(cat => (
              <button key={cat}
                className={`parts-filter__btn${activeCategory === cat ? ' parts-filter__btn--active' : ''}`}
                onClick={() => setActiveCategory(cat)}>
                {cat}
                {cat !== 'All' && (
                  <span className="parts-filter__count">
                    {SAMPLE_PARTS.filter(p => p.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="parts-results-bar">
            <span className="parts-results-count">
              {filtered.length} part{filtered.length !== 1 ? 's' : ''} found
            </span>
            {(search || activeCategory !== 'All' || showAvailableOnly) && (
              <button className="parts-results-reset"
                onClick={() => { setSearch(''); setActiveCategory('All'); setShowAvailableOnly(false); }}>
                Clear filters
              </button>
            )}
          </div>

          {filtered.length > 0 ? (
            <div className="parts-grid">
              {filtered.map(part => <PartCard key={part.id} part={part} />)}
            </div>
          ) : (
            <div className="parts-empty">
              <div className="parts-empty__icon">🔍</div>
              <h3 className="parts-empty__title">No parts found</h3>
              <p className="parts-empty__sub">
                Try a different search or category. If you need a specific part, WhatsApp us and we'll check our full inventory.
              </p>
              <a href={`${waHref}?text=${encodeURIComponent('Hi Mbevha Motors, I am looking for a specific part: ')}`}
                 target="_blank" rel="noreferrer" className="btn btn-whatsapp">
                📲 Ask About a Specific Part
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="parts-notice">
            <div className="parts-notice__icon">ℹ️</div>
            <div>
              <h3 className="parts-notice__title">How to Purchase Parts</h3>
              <p className="parts-notice__text">
                We do not offer online purchases. WhatsApp or call us to confirm availability, arrange payment,
                and collect from our workshop in Dzwerani. We can source specific parts not shown here — just ask!
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                <a href={phoneHref} className="btn btn-outline-red btn-sm">📞 {phoneDisplay}</a>
                <a href={`${waHref}?text=${encodeURIComponent('Hi Mbevha Motors, I want to enquire about a part.')}`}
                   target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-sm">
                  📲 WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PartsPage;
