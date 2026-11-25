// Data-access layer. Only this file should know how links are stored.
import pg from "pg";
import { pool } from "../db.js";
import { DuplicateCodeError } from "../errors.js";

export interface LinkRecord {
  code: string;
  originalUrl: string;
  createdAt: Date;
}

// Postgres reports "this value already exists" as SQLSTATE 23505.
// We also check the constraint name so we only react to OUR primary key.
function isDuplicateCode(err: unknown): boolean {
  return err instanceof pg.DatabaseError && err.code === "23505" && err.constraint === "links_pkey";
}


export async function saveLink(record: LinkRecord): Promise<LinkRecord> {
  try {
    await pool.query(
      "INSERT INTO links (code, original_url, created_at) VALUES ($1, $2, $3)",
      [record.code, record.originalUrl, record.createdAt],
    );
    return record;
  } catch (err) {
    // Translate a Postgres error into our own error, so the service
    // never needs to know anything about Postgres.
    if (isDuplicateCode(err)) throw new DuplicateCodeError(record.code);
    throw err;
  }
}

export async function findLinkByCode(code: string): Promise<LinkRecord | undefined> {
   const result = await pool.query(
    "SELECT code, original_url, created_at FROM links WHERE code = $1",
    [code],
  );
  const row = result.rows[0];
  if(!row) return undefined;
  return { code: row.code, originalUrl: row.original_url, createdAt: row.created_at };
}
