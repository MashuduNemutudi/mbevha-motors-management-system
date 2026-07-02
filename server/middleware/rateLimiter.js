/**
 * middleware/rateLimiter.js
 * ─────────────────────────────────────────────────────────────
 * Rate limiting applied ONLY to the public contact form route.
 *
 * This prevents spam and abuse of the contact form endpoint
 * without restricting any other part of the application.
 *
 * Configuration is driven by environment variables so limits
 * can be adjusted without a code change:
 *   CONTACT_RATE_LIMIT_WINDOW_MS  — window in milliseconds
 *   CONTACT_RATE_LIMIT_MAX        — max requests per window per IP
 *
 * Defaults: 10 submissions per 15 minutes per IP address.
 * ─────────────────────────────────────────────────────────────
 */

const rateLimit = require('express-rate-limit');

const contactFormLimiter = rateLimit({
  windowMs: parseInt(process.env.CONTACT_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.CONTACT_RATE_LIMIT_MAX) || 10,
  message: {
    success: false,
    message: 'Too many submissions from this IP address. Please try again in 15 minutes.',
  },
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,   // Disable the X-RateLimit-* legacy headers
  // Use a custom key to rate-limit by IP only (default behaviour)
  keyGenerator: (req) => req.ip,
});

module.exports = { contactFormLimiter };
