// Creates (or resets) a verified test user for local testing.
// Usage: node scripts/seed-test-user.js
// Credentials: test@afterplot.dev / afterplot123
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

loadEnvLocal();

const EMAIL = 'test@afterplot.dev';
const PASSWORD = 'afterplot123';
const USERNAME = 'tester';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    await client.connect();

    const hash = await bcrypt.hash(PASSWORD, 12);

    await client.query(
      `INSERT INTO users (email, password_hash, username, is_verified)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         is_verified = true`,
      [EMAIL, hash, USERNAME]
    );

    console.log('✅ Usuario de prueba listo:');
    console.log(`   Email:      ${EMAIL}`);
    console.log(`   Contraseña: ${PASSWORD}`);

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seed();
