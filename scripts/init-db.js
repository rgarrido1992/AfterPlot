const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: 'postgresql://postgres:vnoCjAvaWmEQlzviNAtHvDXWdeakcszA@thomas.proxy.rlwy.net:13277/railway',
});

async function initializeDatabase() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente');

    const sqlPath = path.join(__dirname, '..', 'database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📝 Ejecutando schema SQL...');
    await client.query(sql);
    console.log('✅ Schema creado exitosamente');

    await client.end();
    console.log('🎉 Base de datos inicializada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
