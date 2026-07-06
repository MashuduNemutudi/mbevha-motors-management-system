const Spinner = ({ size = 'medium', color = 'primary' }) => (
  <div className={`spinner spinner--${size}${color === 'white' ? ' spinner--white' : ''}`} role="status" aria-label="Loading">
    <div className="spinner__circle" />
  </div>
);
export default Spinner;
