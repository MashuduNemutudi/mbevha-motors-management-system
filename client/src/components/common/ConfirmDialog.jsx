/**
 * components/common/ConfirmDialog.jsx
 * ─────────────────────────────────────────────────────────────
 * Reusable confirmation dialog for destructive actions.
 * Wraps the Modal component.
 *
 * Props:
 *   isOpen    {boolean}
 *   onClose   {function}
 *   onConfirm {function}
 *   title     {string}   — e.g. "Delete Quotation"
 *   message   {string}   — e.g. "This action cannot be undone."
 *   danger    {boolean}  — true → red confirm button
 * ─────────────────────────────────────────────────────────────
 */

import Modal from './Modal';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  danger = true,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p style={{ marginBottom: 24 }}>{message}</p>
    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
      <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      <button
        className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
        onClick={() => { onConfirm(); onClose(); }}
      >
        Confirm
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
