/**
 * config/db.js
 * PostgreSQL connection pool — Neon compatible.
 *
 * FIXES applied:
 *   1. Strips channel_binding=require from the URL — pg does NOT
 *      support channel binding and silently times out when it is present.
 *   2. connectionTimeoutMillis raised to 30 000 ms — Neon free tier
 *      auto-suspends and needs up to 20 s to wake up.
 *   3. Sets sslmode=verify-full to suppress the pg SSL warning.
 *   4. Retries the startup check 3 times with 8-second gaps.
 */

const { Pool } = require('pg');

/* ── Strip parameters that pg cannot handle ────────────────── */
const cleanUrl = (raw) => {
  if (!raw) return raw;
  try {
    const u = new URL(raw);
    u.searchParams.delete('channel_binding');   // pg does NOT support this
    u.searchParams.set('sslmode', 'verify-full'); // suppress pg SSL warning
    return u.toString();
  } catch {
    return raw;
  }
};

const DATABASE_URL = cleanUrl(process.env.DATABASE_URL);

if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL is not set in server/.env');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max:                     5,
  idleTimeoutMillis:      60_000,
  connectionTimeoutMillis: 30_000,   // was 5 000 — too short for Neon cold start
});

/* ── Startup connectivity check with retry ─────────────────── */
const startupCheck = (attempt = 1) => {
  pool.connect((err, client, release) => {
    if (err) {
      console.error(`❌  Database connection failed (attempt ${attempt}/3): ${err.message}`);

      if (attempt < 3) {
        console.error(`    Retrying in 8 s… (Neon may be waking from auto-suspend)`);
        setTimeout(() => startupCheck(attempt + 1), 8_000);
      } else {
        console.error('    All retries exhausted.');
        console.error('    Action: Go to https://console.neon.tech → resume your project,');
        console.error('    then restart the server (rs in nodemon).');
      }
      return;
    }
    release();
    console.log('✅  PostgreSQL connected successfully.');
  });
};

startupCheck();

const db = {
  query: (text, params) => pool.query(text, params),
  pool,
};

module.exports = db;
