/**
 * components/common/Spinner.jsx
 * Reusable loading spinner. Size: 'small' | 'medium' | 'large'
 */

const Spinner = ({ size = 'medium', color = 'primary' }) => {
  return (
    <div className={`spinner spinner--${size} spinner--${color}`} role="status" aria-label="Loading">
      <div className="spinner__circle"></div>
    </div>
  );
};

export default Spinner;
