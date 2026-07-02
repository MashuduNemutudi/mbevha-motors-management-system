/**
 * middleware/errorHandler.js
 * ─────────────────────────────────────────────────────────────
 * Global error handling middleware.
 *
 * Express recognises a four-argument middleware as an error
 * handler. It must be registered LAST in server.js (after all
 * routes) so it can catch errors forwarded via next(err).
 *
 * Behaviour:
 *   - In development: include the full stack trace in the JSON
 *     response to help with debugging.
 *   - In production: return a generic message so internal
 *     implementation details are never exposed to the client.
 * ─────────────────────────────────────────────────────────────
 */

const errorHandler = (err, req, res, next) => {
  // Log every error server-side regardless of environment
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`);
  console.error(err.stack || err.message);

  // Determine HTTP status code
  // Controllers can attach a statusCode property to the error
  const statusCode = err.statusCode || res.statusCode === 200
    ? (err.statusCode || 500)
    : res.statusCode;

  const isDev = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
    // Only expose stack in development
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;
