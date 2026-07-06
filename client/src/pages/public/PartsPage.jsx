import { useState, useMemo } from 'react';
import PageBanner from '../../components/common/PageBanner';
import SectionTitle from '../../components/common/SectionTitle';
import PartCard from '../../components/public/PartCard';

const WA = '27713065615';

/* ── Sample data — will be replaced by API in Phase 4 ───── */
const SAMPLE_PARTS = [
  { id: 1,  name: 'BMW E46 Front Bumper',          brand: 'BMW',        category: 'Body Parts',  condition: 'Used — Good',      price: 1800,  available: true,  image: null },
  { id: 2,  name: 'BMW E46 Rear Bumper',            brand: 'BMW',        category: 'Body Parts',  condition: 'Used — Good',      price: 1500,  available: true,  image: null },
  { id: 3,  name: 'Toyota Corolla Alternator',      brand: 'Toyota',     category: 'Electrical',  condition: 'Used — Good',      price: 950,   available: true,  image: null },
  { id: 4,  name: 'VW Polo 1.4 Gearbox',           brand: 'Volkswagen', category: 'Drivetrain',  condition: 'Used — Fair',      price: 3500,  available: false, image: null },
  { id: 5,  name: 'BMW E36 M52 Engine',             brand: 'BMW',        category: 'Engine',      condition: 'Used — Good',      price: 12000, available: true,  image: null },
  { id: 6,  name: 'Ford Fiesta Starter Motor',      brand: 'Ford',       category: 'Electrical',  condition: 'Used — Good',      price: 600,   available: true,  image: null },
  { id: 7,  name: 'BMW E90 Front Strut Assembly',   brand: 'BMW',        category: 'Suspension',  condition: 'Used — Good',      price: 2200,  available: true,  image: null },
  { id: 8,  name: 'Toyota Hilux Diff Crown Wheel',  brand: 'Toyota',     category: 'Drivetrain',  condition: 'Used — Good',      price: 4500,  available: false, image: null },
  { id: 9,  name: 'BMW E46 Cylinder Head',          brand: 'BMW',        category: 'Engine',      condition: 'Reconditioned',    price: 5500,  available: true,  image: null },
  { id: 10, name: 'Chevrolet Spark Radiator',       brand: 'Chevrolet',  category: 'Cooling',     condition: 'Used — Good',      price: 750,   available: true,  image: null },
  { id: 11, name: 'BMW E90 Steering Rack',          brand: 'BMW',        category: 'Steering',    condition: 'Used — Good',      price: 2800,  available: true,  image: null },
  { id: 12, name: 'Opel Astra Front Caliper Set',   brand: 'Opel',       category: 'Brakes',      condition: 'Used — Good',      price: 1100,  available: false, image: null },
];

const CATEGORIES = ['All', ...Array.from(new Set(SAMPLE_PARTS.map(p => p.category))).sort()];

const PartsPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch]                 = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filtered = useMemo(() => {
    return SAMPLE_PARTS.filter(p => {
      const matchCat  = activeCategory === 'All' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.brand.toLowerCase().includes(search.toLowerCase());
      const matchAvail = !showAvailableOnly || p.available;
      return matchCat && matchSearch && matchAvail;
    });
  }, [activeCategory, search, showAvailableOnly]);

  return (
    <main>
      <PageBanner
        overline="Used Parts"
        title="Quality Used Parts"
        sub="Tested, priced fairly, and ready to fit — enquire via WhatsApp"
        bgImage="/images/gallery/img-workshop-extra2.jpg"
      />

      <section className="section">
        <div className="container">
          <SectionTitle
            overline="Parts Inventory"
            heading="Browse Our Used Parts"
            sub="We stock a wide range of used vehicle parts. Prices are competitive and all parts are tested before sale. Contact us on WhatsApp to confirm availability before visiting."
            center
          />

          {/* ── Search & Filters ─────────────────────────── */}
          <div className="parts-controls">
            <div className="parts-search">
              <span className="parts-search__icon">🔍</span>
              <input
                type="text"
                placeholder="Search by part name or brand…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="parts-search__input"
              />
              {search && (
                <button className="parts-search__clear" onClick={() => setSearch('')}>✕</button>
              )}
            </div>

            <label className="parts-avail-toggle">
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={e => setShowAvailableOnly(e.target.checked)}
              />
              <span>Available only</span>
            </label>
          </div>

          <div className="parts-filter">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`parts-filter__btn${activeCategory === cat ? ' parts-filter__btn--active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
                {cat !== 'All' && (
                  <span className="parts-filter__count">
                    {SAMPLE_PARTS.filter(p => p.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Results count ────────────────────────────── */}
          <div className="parts-results-bar">
            <span className="parts-results-count">
              {filtered.length} part{filtered.length !== 1 ? 's' : ''} found
            </span>
            {(search || activeCategory !== 'All' || showAvailableOnly) && (
              <button
                className="parts-results-reset"
                onClick={() => { setSearch(''); setActiveCategory('All'); setShowAvailableOnly(false); }}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* ── Grid ────────────────────────────────────── */}
          {filtered.length > 0 ? (
            <div className="parts-grid">
              {filtered.map(part => <PartCard key={part.id} part={part} />)}
            </div>
          ) : (
            <div className="parts-empty">
              <div className="parts-empty__icon">🔍</div>
              <h3 className="parts-empty__title">No parts found</h3>
              <p className="parts-empty__sub">
                Try a different search term or category. If you need a specific part, WhatsApp us and we'll check our full inventory.
              </p>
              <a
                href={`https://wa.me/${WA}?text=Hi%20Mbevha%20Motors,%20I%20am%20looking%20for%20a%20specific%20part%3A%20`}
                target="_blank" rel="noreferrer"
                className="btn btn-whatsapp"
              >
                📲 Ask About a Specific Part
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── Notice ──────────────────────────────────────── */}
      <section className="section section--alt">
        <div className="container">
          <div className="parts-notice">
            <div className="parts-notice__icon">ℹ️</div>
            <div>
              <h3 className="parts-notice__title">How to Purchase Parts</h3>
              <p className="parts-notice__text">
                We do not offer online purchases. To buy a part, WhatsApp or call us to confirm availability,
                arrange payment, and collect from our workshop in Dzwerani. We can assist with sourcing
                specific parts not shown here — just ask!
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                <a href="tel:0713065615" className="btn btn-outline-red btn-sm">📞 071 306 5615</a>
                <a
                  href={`https://wa.me/${WA}?text=Hi%20Mbevha%20Motors,%20I%20want%20to%20enquire%20about%20a%20part.`}
                  target="_blank" rel="noreferrer"
                  className="btn btn-whatsapp btn-sm"
                >
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
