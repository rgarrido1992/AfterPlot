// Applies incremental schema changes to an existing database.
// Usage: node scripts/migrate.js (reads DATABASE_URL from env or .env.local)
const { Client } = require('pg');
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

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const MIGRATIONS = [
  {
    name: 'episode_logs unique (user_id, episode_id)',
    sql: `
      DELETE FROM episode_logs a
      USING episode_logs b
      WHERE a.ctid < b.ctid
        AND a.user_id = b.user_id
        AND a.episode_id = b.episode_id;

      ALTER TABLE episode_logs
        ADD CONSTRAINT episode_logs_user_id_episode_id_key UNIQUE (user_id, episode_id);
    `,
    skipIf: `
      SELECT 1 FROM pg_constraint
      WHERE conname = 'episode_logs_user_id_episode_id_key'
    `,
  },
];

async function migrate() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    await client.connect();

    for (const migration of MIGRATIONS) {
      const check = await client.query(migration.skipIf);
      if (check.rows.length > 0) {
        console.log(`⏭️  Ya aplicada: ${migration.name}`);
        continue;
      }
      console.log(`📝 Aplicando: ${migration.name}`);
      await client.query('BEGIN');
      await client.query(migration.sql);
      await client.query('COMMIT');
      console.log(`✅ Aplicada: ${migration.name}`);
    }

    await client.end();
    console.log('🎉 Migraciones completadas');
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Error en la migración:', error.message);
    process.exit(1);
  }
}

migrate();
