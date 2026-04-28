import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgres://postgres:NfCNPIO8D6B7kPUPfELZA6DqYCWUDPlphDZVsR3kkPL2bRVM8s9LOaRYkCExewkl@43.129.50.214:5432/postgres',
  ssl: false
});

const res = await pool.query(`
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name LIKE 'cms_web_%'
  ORDER BY table_name
`);

console.log('Tabel CMS yang ada di DB production:');
if (res.rows.length === 0) {
  console.log('  (tidak ada tabel cms_web_* ditemukan!)');
} else {
  res.rows.forEach(row => console.log(' -', row.table_name));
}

// Cek juga data di cms_web_posts jika ada
const hasPostsTable = res.rows.some(r => r.table_name === 'cms_web_posts');
if (hasPostsTable) {
  const posts = await pool.query('SELECT id, title, status FROM cms_web_posts LIMIT 5');
  console.log('\nData cms_web_posts (maks 5):');
  if (posts.rows.length === 0) {
    console.log('  (kosong - belum ada artikel yang disimpan)');
  } else {
    posts.rows.forEach(p => console.log(`  [${p.status}] ${p.id}: ${p.title}`));
  }
}

await pool.end();
