/**
 * components/public/PartCard.jsx
 * ─────────────────────────────────────────────────────────────
 * Individual part card displayed on the Used Parts page.
 *
 * Props:
 *   part {object} — { id, name, category, description, price,
 *                     quantity, is_available, image_url }
 *
 * Features (Phase 3):
 *   - Part image (with fallback placeholder)
 *   - Name, category badge, description
 *   - Price in ZAR
 *   - Availability badge
 *   - WhatsApp enquiry button (links to wa.me with pre-filled message)
 *
 * TODO (Phase 3): Build full PartCard with WhatsApp link.
 */

import { formatCurrency } from '../../utils/formatCurrency';

const PartCard = ({ part }) => (
  <div className="part-card">
    <div className="part-card__image">
      {part.image_url
        ? <img src={part.image_url} alt={part.name} />
        : <div className="part-card__no-image">No Image</div>
      }
    </div>
    <div className="part-card__body">
      <span className="badge badge--grey">{part.category}</span>
      <h3 className="part-card__name">{part.name}</h3>
      <p className="part-card__desc">{part.description}</p>
      <p className="part-card__price">{formatCurrency(part.price)}</p>
    </div>
  </div>
);

export default PartCard;
