// Demo script: two inserts of the SAME code at the same moment.
// Run with:  npm run race-demo
import { saveLink } from "../repositories/links.js";
import { pool } from "../db.js";

const code = `demo${Date.now() % 1000}`;
const record = { code, originalUrl: "https://example.com/race", createdAt: new Date() };

// Promise.allSettled starts BOTH calls immediately, then waits for both.
const results = await Promise.allSettled([saveLink(record), saveLink(record)]);

results.forEach((r, i) => {
  if (r.status === "fulfilled") console.log(`call ${i + 1}: saved`);
  else console.log(`call ${i + 1}: rejected -> ${r.reason.constructor.name}: ${r.reason.message}`);
});

await pool.query("DELETE FROM links WHERE code = $1", [code]); // clean up
await pool.end();