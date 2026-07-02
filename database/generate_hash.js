/**
 * MMMS — Admin Password Hash Generator
 * =====================================
 * Run this script locally to generate a bcrypt hash for the
 * default admin password before seeding the database.
 *
 * Usage:
 *   node generate_hash.js
 *
 * Then copy the printed hash into seed.sql and run:
 *   psql <connection_string> -f seed.sql
 */

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

// Change this to your chosen password before running
const plainTextPassword = 'MbevhaAdmin2026!';

async function generateHash() {
    console.log('Generating bcrypt hash...\n');
    const hash = await bcrypt.hash(plainTextPassword, SALT_ROUNDS);
    console.log('Password  :', plainTextPassword);
    console.log('Hash      :', hash);
    console.log('\nCopy the hash above into seed.sql, then run:');
    console.log('  psql <your_neon_connection_string> -f seed.sql');
}

generateHash().catch(console.error);
