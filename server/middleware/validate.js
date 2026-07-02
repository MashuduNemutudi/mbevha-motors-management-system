/**
 * middleware/validate.js
 * ─────────────────────────────────────────────────────────────
 * Lightweight input validation helpers used across controllers.
 *
 * Keeps validation logic out of controllers and routes.
 * Returns a consistent error response shape when validation fails.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Checks that all required fields are present and non-empty.
 * Returns an array of field names that failed the check.
 *
 * @param {object} body  - req.body
 * @param {string[]} required - field names that must be present
 * @returns {string[]} missing field names
 */
const getMissingFields = (body, required) =>
  required.filter((field) => {
    const val = body[field];
    return val === undefined || val === null || String(val).trim() === '';
  });

/**
 * Express middleware factory.
 * Usage: router.post('/messages', requireFields(['name','phone','message']), controller)
 */
const requireFields = (fields) => (req, res, next) => {
  const missing = getMissingFields(req.body, fields);
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(', ')}.`,
    });
  }
  next();
};

module.exports = { getMissingFields, requireFields };
