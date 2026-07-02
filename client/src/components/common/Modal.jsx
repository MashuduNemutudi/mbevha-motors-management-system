/**
 * components/common/Modal.jsx
 * ─────────────────────────────────────────────────────────────
 * Reusable modal overlay component.
 *
 * Props:
 *   isOpen    {boolean}  — show or hide the modal
 *   onClose   {function} — called when backdrop or X is clicked
 *   title     {string}   — modal heading
 *   children  {node}     — modal body content
 *   size      {string}   — 'sm' | 'md' | 'lg' (default: 'md')
 *
 * Features (Phase 4+):
 *   - Focus trap inside modal
 *   - Escape key closes modal
 *   - Backdrop click closes modal
 *   - Scroll lock on body when open
 * ─────────────────────────────────────────────────────────────
 * TODO (Phase 4): Add focus trap and keyboard handling.
 */

import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`modal modal--${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
