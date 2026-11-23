// Data-access layer. Only this file should know how links are stored.
// In-memory placeholder; swap for a real database later.
import { pool } from "../db.js";

export interface LinkRecord {
  code: string;
  originalUrl: string;
  createdAt: Date;
}

export async function saveLink(record: LinkRecord): Promise<LinkRecord> {
  await pool.query(
    "INSERT INTO links (code, original_url, created_at) VALUES ($1, $2, $3)",
    [record.code, record.originalUrl, record.createdAt],
  );
  return record;
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
