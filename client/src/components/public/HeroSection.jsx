/* HeroSection is built inline in HomePage for maximum flexibility.
   This export exists for future reuse. */
const HeroSection = ({ businessName, motto }) => (
  <section className="hero">
    <div className="hero__overlay" />
    <div className="container hero__content">
      <h1 className="hero__title">{businessName || 'Mbevha Motors'}</h1>
      <p style={{ color: '#aaa' }}>{motto}</p>
    </div>
  </section>
);
export default HeroSection;
