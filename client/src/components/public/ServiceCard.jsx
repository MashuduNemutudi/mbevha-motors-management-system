const ServiceCard = ({ icon, title, description }) => (
  <div className="service-card">
    <div className="service-card__icon">{icon}</div>
    <h3 className="service-card__title">{title}</h3>
    <p className="service-card__desc">{description}</p>
  </div>
);

export default ServiceCard;
