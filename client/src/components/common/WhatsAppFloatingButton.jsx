import { useState } from 'react';
import { useBusiness, toWaNumber } from '../../context/BusinessContext';

const WhatsAppFloatingButton = () => {
  const { business } = useBusiness();
  const [hover, setHover] = useState(false);

  const waHref = `https://wa.me/${toWaNumber(business.whatsapp_number)}?text=${
    encodeURIComponent(
      `Hi ${business.business_name || 'Mbevha Motors'}, I would like to enquire about your services.`
    )
  }`;

  return (
    <div className="whatsapp-float">
      {hover && (
        <div className="whatsapp-float__bubble">Chat with us on WhatsApp 👋</div>
      )}
      <a
        href={waHref}
        target="_blank" rel="noreferrer"
        className="whatsapp-float__btn"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label="Chat on WhatsApp"
      >
        📲
      </a>
    </div>
  );
};

export default WhatsAppFloatingButton;
