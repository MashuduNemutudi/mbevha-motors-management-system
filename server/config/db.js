/**
 * config/db.js
 * ─────────────────────────────────────────────────────────────
 * PostgreSQL connection pool using the `pg` library.
 *
 * Why a pool?
 *   A pool keeps a set of ready-made connections open so the
 *   server does not pay the TCP + TLS handshake cost on every
 *   request. Neon (serverless PostgreSQL) works best with a
 *   small pool size (2–5) because it auto-scales on the DB side.
 *
 * SSL:
 *   Neon requires SSL. We pass rejectUnauthorized: false for
 *   compatibility with their managed certificates. In a
 *   self-hosted production environment, supply the CA cert.
 * ─────────────────────────────────────────────────────────────
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // Neon uses managed TLS — certificate verification would
    // require bundling Neon's CA. false is safe here because
    // the connection string itself is the secret.
    rejectUnauthorized: false,
  },
  // Keep the pool small for serverless-friendly behaviour
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Verify connectivity at startup and surface clear errors
pool.connect((err, client, release) => {
  if (err) {
    console.error(err);
    console.error('    Check DATABASE_URL in your .env file.');
    return;
  }
  release();
  console.log('✅  PostgreSQL connected successfully.');
});

/**
 * Convenience query wrapper.
 * Usage: const { rows } = await db.query('SELECT * FROM parts', []);
 */
const db = {
  query: (text, params) => pool.query(text, params),
  pool,
};

module.exports = db;
