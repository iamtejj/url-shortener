import pg from "pg";

const { DATABASE_URL } = process.env;

// Fail fast: without this, pg silently falls back to default settings
// and may connect to the wrong database.
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
}

export const pool = new pg.Pool({
  connectionString: DATABASE_URL,
});