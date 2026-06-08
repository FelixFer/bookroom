import { Pool } from "pg";
async function main() {
  const cs = process.env.DATABASE_URL ?? "not set";
  console.log("Connecting...");
  try {
    const pool = new Pool({ connectionString: cs, connectionTimeoutMillis: 5000 });
    const r = await pool.query("SELECT 1 as test");
    console.log("Connection OK:", r.rows[0]);
    const r2 = await pool.query('SELECT id, email FROM "User"');
    console.log("Users:", JSON.stringify(r2.rows));
    const r3 = await pool.query('SELECT * FROM "Bookmark"');
    console.log("Bookmarks:", JSON.stringify(r3.rows));
    await pool.end();
  } catch (e: any) {
    console.error("Error:", e?.message ?? String(e));
  }
}
main();
