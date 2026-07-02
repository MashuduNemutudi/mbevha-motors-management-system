/**
 * services/activityService.js
 * ─────────────────────────────────────────────────────────────
 * Centralised service for writing to the activity_logs table.
 *
 * Every admin action (create quotation, upload image, etc.)
 * calls logActivity() so the dashboard activity feed is always
 * populated without scattering INSERT statements across controllers.
 *
 * Action codes used across the system:
 *   CREATE_QUOTATION    FINALIZE_QUOTATION   DELETE_QUOTATION
 *   CREATE_INVOICE      MARK_PAID            DELETE_INVOICE
 *   ADD_PART            UPDATE_PART          DELETE_PART
 *   UPLOAD_IMAGE        DELETE_IMAGE         UPDATE_CAPTION
 *   DELETE_MESSAGE
 *   UPDATE_BUSINESS     CHANGE_PASSWORD
 * ─────────────────────────────────────────────────────────────
 */

const db = require('../config/db');

/**
 * Write one activity log entry.
 *
 * @param {object} params
 * @param {string} params.adminId    - UUID of the acting admin
 * @param {string} params.action     - Action code string
 * @param {string} params.entityType - e.g. 'quotation', 'part', 'gallery'
 * @param {string} [params.entityId] - UUID of the affected record (optional)
 * @param {string} params.description - Human-readable log message
 */
const logActivity = async ({ adminId, action, entityType, entityId = null, description }) => {
  try {
    await db.query(
      `INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId, action, entityType, entityId, description]
    );
  } catch (err) {
    // Log failure to console but never throw — a failed log entry
    // must never break the primary operation that triggered it.
    console.error('[ActivityLog] Failed to write log entry:', err.message);
  }
};

module.exports = { logActivity };
