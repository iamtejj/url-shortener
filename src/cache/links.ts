// Cache layer for short links (Redis). The service decides WHEN to use it;
// this file only knows HOW. Every function swallows Redis errors: a broken
// cache must never break redirects.
import { redis } from "../redis.js";

const TTL_SECONDS = 60 * 60; // a found link is cached for 1 hour
const NOT_FOUND_TTL_SECONDS = 30; // "does not exist" is cached only briefly
const NOT_FOUND_MARKER = "__not_found__";

const keyFor = (code: string) => `link:${code}`;

// A miss means "ask the database". A hit has either the URL, or url=null
// meaning "we recently checked and this code does not exist".
export type CacheLookup = { hit: false } | { hit: true; url: string | null };

export async function getCachedUrl(code: string): Promise<CacheLookup> {
  try {
    const value = await redis.get(keyFor(code));
    if (value === null) return { hit: false };
    if (value === NOT_FOUND_MARKER) return { hit: true, url: null };
    return { hit: true, url: value };
  } catch (err) {
    console.error("[cache] get failed, treating as miss:", (err as Error).message);
    return { hit: false };
  }
}

export async function cacheUrl(code: string, url: string): Promise<void> {
  try {
    await redis.set(keyFor(code), url, { EX: TTL_SECONDS });
  } catch (err) {
    console.error("[cache] set failed:", (err as Error).message);
  }
}

// "Negative caching": remember that a code does not exist, so repeated bad
// codes do not hit the database every time.
export async function cacheNotFound(code: string): Promise<void> {
  try {
    await redis.set(keyFor(code), NOT_FOUND_MARKER, { EX: NOT_FOUND_TTL_SECONDS });
  } catch (err) {
    console.error("[cache] set failed:", (err as Error).message);
  }
}

// Invalidation: call this whenever a link is changed or deleted, otherwise
// users keep getting the old destination until the TTL expires.
export async function invalidateLink(code: string): Promise<void> {
  try {
    await redis.del(keyFor(code));
  } catch (err) {
    console.error("[cache] delete failed:", (err as Error).message);
  }
}