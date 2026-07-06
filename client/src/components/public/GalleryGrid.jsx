import { useState, useCallback, useEffect } from 'react';

const GalleryGrid = ({ images, className = 'gallery-grid' }) => {
  const [lightbox, setLightbox] = useState(null); // index

  const open  = (i) => setLightbox(i);
  const close = ()  => setLightbox(null);
  const prev  = ()  => setLightbox(i => (i - 1 + images.length) % images.length);
  const next  = ()  => setLightbox(i => (i + 1) % images.length);

  const onKey = useCallback((e) => {
    if (lightbox === null) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  }, [lightbox]);

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  // Lock scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightbox]);

  return (
    <>
      <div className={className}>
        {images.map((img, i) => (
          <div
            key={i}
            className={`gallery-item${img.wide ? ' gallery-item--wide' : ''}${img.tall ? ' gallery-item--tall' : ''}`}
            onClick={() => open(i)}
          >
            <img src={img.src} alt={img.caption || `Workshop image ${i + 1}`} loading="lazy" />
            <div className="gallery-item__overlay">
              {img.caption && <span className="gallery-item__caption">{img.caption}</span>}
            </div>
            <div className="gallery-item__icon">🔍</div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="lightbox" onClick={close}>
          <button className="lightbox__close" onClick={close} aria-label="Close">✕</button>
          <button className="lightbox__nav lightbox__prev" onClick={e => { e.stopPropagation(); prev(); }} aria-label="Previous">‹</button>
          <button className="lightbox__nav lightbox__next" onClick={e => { e.stopPropagation(); next(); }} aria-label="Next">›</button>

          <div className="lightbox__img-wrap" onClick={e => e.stopPropagation()}>
            <img className="lightbox__img" src={images[lightbox].src} alt={images[lightbox].caption || ''} />
            {images[lightbox].caption && (
              <p className="lightbox__caption">{images[lightbox].caption}</p>
            )}
            <p className="lightbox__counter">{lightbox + 1} / {images.length}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryGrid;
