// Business logic lives here. Routes call services; services call repositories.

import { randomBytes } from "crypto";
import { findLinkByCode, saveLink } from "../repositories/links.js";
import { AppError, NotFoundError } from "../errors.js";
export interface LinkDto {
  code: string;
  shortUrl: string;
  originalUrl: string;
}

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const MAX_CODE_ATTEMPTS = 5;

export async function createLink(url: string): Promise<LinkDto> {
  const code = await generateUniqueCode();
  await saveLink({ code, originalUrl: url, createdAt: new Date() });
  return { code, shortUrl: `${BASE_URL}/${code}`, originalUrl: url };
}

async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const code = randomBytes(5).toString("base64url").slice(0, 7);
    if (!(await findLinkByCode(code))) return code;
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


export async function resolveLink(code: string): Promise<string | null> {
  return (await findLinkByCode(code))?.originalUrl ?? null;
}