import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  const r1 = await pool.query('SELECT COUNT(*) as cnt FROM "User"');
  console.log('Users count:', r1.rows[0].cnt);

  const r2 = await pool.query('SELECT id, email FROM "User"');
  console.log('User IDs:', r2.rows.map(r => ({ id: r.id, email: r.email })));

  const r3 = await pool.query('SELECT COUNT(*) as cnt FROM "Bookmark"');
  console.log('Bookmarks count:', r3.rows[0].cnt);

  const r4 = await pool.query('SELECT * FROM "Bookmark"');
  console.log('Bookmarks:', JSON.stringify(r4.rows, null, 2));
} catch (e) {
  console.error('DB Error:', e.message);
} finally {
  await pool.end();
}
