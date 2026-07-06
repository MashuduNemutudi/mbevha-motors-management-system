import { Link } from 'react-router-dom';

const PageBanner = ({ overline, title, sub, bgImage }) => (
  <section className="page-banner">
    {bgImage && (
      <div className="page-banner__bg" style={{ backgroundImage: `url(${bgImage})` }} />
    )}
    <div className="page-banner__accent" />
    <div className="container page-banner__content">
      {overline && <span className="page-banner__overline">{overline}</span>}
      <h1 className="page-banner__title">{title}</h1>
      {sub && <p className="page-banner__sub">{sub}</p>}
      <div className="page-banner__breadcrumb">
        <Link to="/">Home</Link>
        <span className="page-banner__breadcrumb-sep">›</span>
        <span>{title}</span>
      </div>
    </div>
  </section>
);

export default PageBanner;
