import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBusiness, toWaNumber } from '../../context/BusinessContext';
import { getGalleryApi }  from '../../api/galleryApi';
import PageBanner   from '../../components/common/PageBanner';
import SectionTitle from '../../components/common/SectionTitle';
import GalleryGrid  from '../../components/public/GalleryGrid';
import Spinner      from '../../components/common/Spinner';

const UPLOADS_BASE = import.meta.env.VITE_API_URL || '';

/* Static fallback — shown while DB is empty or API unreachable */
const STATIC_FALLBACK = [
  { src: '/images/gallery/img-brand-sign.jpg',     caption: 'Mbevha Motors — Notable Hands, We Do Quality', wide: true },
  { src: '/images/gallery/img-entrance-close.jpg', caption: 'Our workshop entrance — Dzwerani, Limpopo'             },
  { src: '/images/gallery/img-exterior-wide.jpg',  caption: 'Mbevha Motors premises — Vuwani Road',         wide: true },
  { src: '/images/gallery/img-interior-bay.jpg',   caption: 'Workshop bay — vehicles in for service'                },
  { src: '/images/gallery/img-workshop-extra1.jpg',caption: 'Workshop operations'                                   },
  { src: '/images/gallery/img-workshop-extra2.jpg',caption: 'Professional workshop facilities'                      },
  { src: '/images/gallery/img-workshop-extra3.jpg',caption: 'Our team at work'                                      },
  { src: '/images/gallery/img-workshop-notice.jpg',caption: 'Mbevha Motors — workshop signage'                      },
];

const GalleryPage = () => {
  const { business } = useBusiness();
  const address = business.address || 'Dzwerani, Mahematshena — Vuwani Road, Opposite Mavikos';

  const [images, setImages]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res  = await getGalleryApi();
        const data = res.data.data || [];
        setImages(
          data.length > 0
            ? data.map(img => ({
                src:     `${UPLOADS_BASE}/uploads/gallery/${img.image_url}`,
                caption: img.caption || '',
              }))
            : STATIC_FALLBACK
        );
      } catch {
        setImages(STATIC_FALLBACK);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
            sub="Click any image to view it in full size. Use arrow keys or navigation buttons to browse."
            center
          />

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <Spinner size="large" />
            </div>
          ) : (
            <>
              <GalleryGrid images={images} className="gallery-page-grid" />
              <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--clr-grey-500)', fontSize: 13 }}>
                {images.length} image{images.length !== 1 ? 's' : ''} — click to enlarge
              </p>
            </>
          )}
        </div>
      </section>

      {/* Simple address strip — no redundant CTA buttons */}
      <section className="section section--alt">
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: 'var(--clr-grey-700)', marginBottom: 8 }}>
            📍 {address}
          </p>
          <p style={{ fontSize: 14, color: 'var(--clr-grey-500)', marginBottom: 24 }}>
            {business.opening_hours || 'Mon–Fri: 07:30–17:00 | Sat: 08:00–13:00 | Sun: Closed'}
          </p>
          <Link to="/contact" className="btn btn-outline-red">
            Get Directions & Contact Us →
          </Link>
        </div>
      </section>
    </main>
  );
};

export default GalleryPage;
