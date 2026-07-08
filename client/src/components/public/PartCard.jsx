import { useBusiness, toWaNumber } from '../../context/BusinessContext';
import { formatCurrency } from '../../utils/formatCurrency';

const PartCard = ({ part }) => {
  const { business } = useBusiness();
  const waHref = `https://wa.me/${toWaNumber(business.whatsapp_number)}?text=${
    encodeURIComponent(
      `Hi ${business.business_name || 'Mbevha Motors'}, I'm interested in the ${part.name} — R${part.price}. Is it still available?`
    )
  }`;

  return (
    <div className="part-card">
      <div className="part-card__image">
        {part.image ? (
          <img src={part.image} alt={part.name} loading="lazy" />
        ) : (
          <div className="part-card__no-image">
            <span>🔧</span>
            <span>No Image</span>
          </div>
        )}
        <div className="part-card__availability">
          {part.available
            ? <span className="badge badge--green">Available</span>
            : <span className="badge badge--red">Sold</span>
          }
        </div>
      </div>

      <div className="part-card__body">
        <div className="part-card__category">{part.category}</div>
        <h3 className="part-card__name">{part.name}</h3>

        <div className="part-card__meta">
          {part.brand && (
            <div className="part-card__meta-row">
              <span className="part-card__meta-label">Brand</span>
              <span className="part-card__meta-value">{part.brand}</span>
            </div>
          )}
          <div className="part-card__meta-row">
            <span className="part-card__meta-label">Condition</span>
            <span className="part-card__meta-value">{part.condition}</span>
          </div>
        </div>

        <div className="part-card__price">
          {formatCurrency(part.price)} <span>ZAR</span>
        </div>

        <a
          href={waHref}
          target="_blank" rel="noreferrer"
          className={`btn btn-whatsapp btn-full btn-sm${!part.available ? ' disabled' : ''}`}
          onClick={e => { if (!part.available) e.preventDefault(); }}
          style={{ opacity: part.available ? 1 : 0.5, pointerEvents: part.available ? 'auto' : 'none' }}
        >
          📲 Enquire on WhatsApp
        </a>
      </div>
    </div>
  );
};

export default PartCard;
