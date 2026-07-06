import { formatCurrency } from '../../utils/formatCurrency';

const WA = '27713065615';

const PartCard = ({ part }) => {
  const waMsg = encodeURIComponent(
    `Hi Mbevha Motors, I'm interested in the ${part.name} (${part.brand}) — R${part.price}. Is it still available?`
  );

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
          <div className="part-card__meta-row">
            <span className="part-card__meta-label">Vehicle Brand</span>
            <span className="part-card__meta-value">{part.brand}</span>
          </div>
          <div className="part-card__meta-row">
            <span className="part-card__meta-label">Condition</span>
            <span className="part-card__meta-value">{part.condition}</span>
          </div>
        </div>

        <div className="part-card__price">
          {formatCurrency(part.price)} <span>ZAR</span>
        </div>

        <a
          href={`https://wa.me/${WA}?text=${waMsg}`}
          target="_blank" rel="noreferrer"
          className={`btn btn-whatsapp btn-full btn-sm${!part.available ? ' disabled' : ''}`}
          onClick={e => { if (!part.available) e.preventDefault(); }}
        >
          📲 Enquire on WhatsApp
        </a>
      </div>
    </div>
  );
};

export default PartCard;
