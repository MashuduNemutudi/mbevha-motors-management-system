const SectionTitle = ({ overline, heading, sub, center = false, light = false }) => (
  <div className={`section-title${center ? ' section-title--center' : ''}${light ? ' section-title--light' : ''}`}>
    {overline && <span className="section-title__overline">{overline}</span>}
    <h2 className="section-title__heading">{heading}</h2>
    <div className="section-title__line" />
    {sub && <p className="section-title__sub">{sub}</p>}
  </div>
);

export default SectionTitle;
