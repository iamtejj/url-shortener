import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { pool } from "../db.js";

// <project root>/migrations, resolved relative to THIS file so it works
// no matter which folder you run the command from.
const MIGRATIONS_DIR = fileURLToPath(new URL("../../migrations/", import.meta.url));

async function migrate(): Promise<void> {
  // 1. The runner owns this bookkeeping table.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  // 2. Which migrations already ran?
  const applied = await pool.query<{ version: string }>("SELECT version FROM schema_migrations");
  const appliedVersions = new Set(applied.rows.map((row) => row.version));

  // 3. All migration files, in name order (001 before 002 ...).
  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();

  // 4. Apply each missing one inside its own transaction.
  for (const file of files) {
    if (appliedVersions.has(file)) {
      console.log(`skip     ${file} (already applied)`);
      continue;
    }

    const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
    const client = await pool.connect(); // ONE connection, so BEGIN..COMMIT stay together
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`applied  ${file}`);
    } catch (err) {
      await client.query("ROLLBACK"); // undo this file completely
      console.error(`FAILED   ${file}`);
      throw err;
    } finally {
      client.release(); // always give the connection back
    }
  }
}

migrate()
  .then(() => pool.end())
  .catch(async (err) => {
    console.error(err);
    await pool.end();
    process.exit(1);
  });