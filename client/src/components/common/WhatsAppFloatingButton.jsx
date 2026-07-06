import { useState } from 'react';

const WA = '27713065615';

const WhatsAppFloatingButton = () => {
  const [hover, setHover] = useState(false);

  return (
    <div className="whatsapp-float">
      {hover && (
        <div className="whatsapp-float__bubble">
          Chat with us on WhatsApp 👋
        </div>
      )}
      <a
        href={`https://wa.me/${WA}?text=Hi%20Mbevha%20Motors,%20I%20would%20like%20to%20enquire%20about%20your%20services.`}
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
