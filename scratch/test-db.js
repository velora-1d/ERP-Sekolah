const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.production' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

async function test() {
  console.log('Menghubungkan ke:', process.env.DATABASE_URL.split('@')[1]);
  try {
    const start = Date.now();
    const client = await pool.connect();
    console.log('✅ Terhubung dalam', Date.now() - start, 'ms');
    const res = await client.query('SELECT NOW()');
    console.log('Hasil query:', res.rows[0]);
    client.release();
  } catch (err) {
    console.error('❌ Gagal terhubung:', err.message);
  } finally {
    await pool.end();
  }
}

test();
