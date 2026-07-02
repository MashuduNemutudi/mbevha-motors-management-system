/**
 * components/common/StatusBadge.jsx
 * ─────────────────────────────────────────────────────────────
 * Coloured pill badge for displaying statuses.
 *
 * Used for:
 *   - Quotation status: draft (grey) / final (green)
 *   - Invoice payment: pending (orange) / paid (green)
 *   - Part availability: available (green) / unavailable (red)
 *
 * Props:
 *   status  {string}  — the status value
 *   type    {string}  — 'quotation' | 'invoice' | 'part'
 * ─────────────────────────────────────────────────────────────
 */

const STATUS_MAP = {
  // Quotation statuses
  draft:     { label: 'Draft',       className: 'badge--grey'   },
  final:     { label: 'Final',       className: 'badge--green'  },
  // Invoice payment statuses
  pending:   { label: 'Pending',     className: 'badge--orange' },
  paid:      { label: 'Paid',        className: 'badge--green'  },
  // Part availability
  true:      { label: 'Available',   className: 'badge--green'  },
  false:     { label: 'Unavailable', className: 'badge--red'    },
};

const StatusBadge = ({ status }) => {
  const key = String(status).toLowerCase();
  const config = STATUS_MAP[key] || { label: status, className: 'badge--grey' };

  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
