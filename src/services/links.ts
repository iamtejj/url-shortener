// Business logic lives here. Routes call services; services call repositories.

import { randomBytes } from "node:crypto";
import { findLinkByCode, saveLink } from "../repositories/links.js";
import { AppError, NotFoundError, DuplicateCodeError } from "../errors.js";
import { cacheNotFound, cacheUrl, getCachedUrl } from "../cache/links.js";
export interface LinkDto {
  code: string;
  shortUrl: string;
  originalUrl: string;
}

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const MAX_CODE_ATTEMPTS = 5;

function generateCode(): string {
  return randomBytes(5).toString("base64url").slice(0, 7);
}

// No "check first" step any more. We just try to save, and let the database
// (PRIMARY KEY) tell us if the code is taken. This is safe even when many
// requests run at the same time.
export async function createLink(url: string): Promise<LinkDto> {
  for (let attempt = 1; attempt <= MAX_CODE_ATTEMPTS; attempt++) {
    const code = generateCode();
    try {
      await saveLink({ code, originalUrl: url, createdAt: new Date() });
      return { code, shortUrl: `${BASE_URL}/${code}`, originalUrl: url };
    } catch (err) {
      if (err instanceof DuplicateCodeError) continue; // code taken: try another
      throw err; // any other error is a real problem
    }
  }
  throw new AppError(
    500,
    "CODE_GENERATION_FAILED",
    `Could not generate a unique code after ${MAX_CODE_ATTEMPTS} attempts`,
  );
}

export async function getLink(code: string): Promise<LinkDto> {
  const record = await findLinkByCode(code);
  if (!record) throw new NotFoundError(`Link '${code}' not found`);
  return { code: record.code, shortUrl: `${BASE_URL}/${record.code}`, originalUrl: record.originalUrl };
}


// Cache-aside: look in Redis first; on a miss ask Postgres, then fill the cache.
export async function resolveLink(code: string): Promise<string> {
  const cached = await getCachedUrl(code);
  if (cached.hit) {
    if (cached.url === null) throw new NotFoundError(`Link '${code}' not found`);
    return cached.url; // cache hit: Postgres is never touched
  }

  const record = await findLinkByCode(code); // cache miss
  if (!record) {
    await cacheNotFound(code);
    throw new NotFoundError(`Link '${code}' not found`);
  }
  await cacheUrl(code, record.originalUrl);
  return record.originalUrl;
}