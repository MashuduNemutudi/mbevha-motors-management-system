import { useState, useEffect, useMemo } from 'react';
import { useBusiness, toWaNumber }  from '../../context/BusinessContext';
import { getPartsApi }              from '../../api/partsApi';
import PageBanner   from '../../components/common/PageBanner';
import SectionTitle from '../../components/common/SectionTitle';
import PartCard     from '../../components/public/PartCard';
import Spinner      from '../../components/common/Spinner';

const UPLOADS_BASE = import.meta.env.VITE_API_URL || '';

const PartsPage = () => {
  const { business } = useBusiness();
  const waHref       = `https://wa.me/${toWaNumber(business.whatsapp_number)}`;
  const phoneHref    = `tel:${(business.phone || '').replace(/\s/g, '')}`;
  const phoneDisplay = business.phone || '071 306 5615';

  const [parts, setParts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const [activeCategory, setActiveCategory]     = useState('All');
  const [search, setSearch]                     = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Fetch all parts (admin can see all; public shows all, filtered client-side)
        const res = await getPartsApi();
        // Normalise image_url to full path
        const data = (res.data.data || []).map(p => ({
          ...p,
          image: p.image_url ? `${UPLOADS_BASE}/uploads/parts/${p.image_url}` : null,
          available: p.is_available,
          brand: p.brand || '',
          condition: p.condition || 'Used',
        }));
        setParts(data);
      } catch {
        setError('Failed to load parts. Please try again later.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const CATEGORIES = useMemo(
    () => ['All', ...Array.from(new Set(parts.map(p => p.category))).sort()],
    [parts]
  );

  const filtered = useMemo(() =>
    parts.filter(p => {
      const matchCat    = activeCategory === 'All' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchAvail  = !showAvailableOnly || p.available;
      return matchCat && matchSearch && matchAvail;
    }),
    [parts, activeCategory, search, showAvailableOnly]
  );

  return (
    <main>
      <PageBanner overline="Used Parts" title="Quality Used Parts"
        sub="Tested, priced fairly, and ready to fit — enquire via WhatsApp"
        bgImage="/images/gallery/img-workshop-extra2.jpg" />

      <section className="section">
        <div className="container">
          <SectionTitle overline="Parts Inventory" heading="Browse Our Used Parts"
            sub="All parts are tested before sale. WhatsApp or call us to confirm availability before visiting."
            center />

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size="large" /></div>
          ) : error ? (
            <div className="alert alert--danger">{error}</div>
          ) : (
            <>
              {/* Search & Filters */}
              <div className="parts-controls">
                <div className="parts-search">
                  <span className="parts-search__icon">🔍</span>
                  <input type="text" placeholder="Search by part name…"
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
                        {parts.filter(p => p.category === cat).length}
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
                    Try a different search or category. WhatsApp us to ask about a specific part.
                  </p>
                  <a href={`${waHref}?text=${encodeURIComponent('Hi Mbevha Motors, I am looking for a specific part: ')}`}
                     target="_blank" rel="noreferrer" className="btn btn-whatsapp">
                    📲 Ask About a Specific Part
                  </a>
                </div>
              )}
            </>
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
                and collect from our workshop in Dzwerani.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
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
