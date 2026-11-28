// Demo: shows cache miss -> hit, timing, TTL, and negative caching.
// Run with:  npm run cache-demo
import { createLink, resolveLink } from "../services/links.js";
import { getCachedUrl, invalidateLink } from "./links.js";
import { redis } from "../redis.js";
import { pool } from "../db.js";

async function timed<T>(label: string, fn: () => Promise<T>): Promise<void> {
  const start = performance.now();
  try {
    await fn();
  } catch (err) {
    label += ` (${(err as Error).constructor.name})`;
  }
  console.log(`${label.padEnd(50)} ${(performance.now() - start).toFixed(2)} ms`);
}

// Wait until the Redis client is connected (it connects in the background).
while (!redis.isReady) await new Promise((r) => setTimeout(r, 50));

const { code } = await createLink("https://example.com/cache-demo");
await invalidateLink(code); // start from an empty cache

console.log("in cache before first request?", await getCachedUrl(code));
await timed("request 1 (miss -> Postgres)", () => resolveLink(code));
console.log("in cache after first request? ", await getCachedUrl(code));
await timed("request 2 (hit -> Redis)", () => resolveLink(code));
await timed("request 3 (hit -> Redis)", () => resolveLink(code));
console.log("TTL left (seconds):", await redis.ttl(`link:${code}`));

console.log("\nunknown code:");
await timed("bad code, 1st (miss -> Postgres)", () => resolveLink("nope999"));
await timed("bad code, 2nd (negative cache)", () => resolveLink("nope999"));
console.log("TTL of negative entry:", await redis.ttl("link:nope999"));

await pool.query("DELETE FROM links WHERE code = $1", [code]); // clean up
await invalidateLink(code);
await invalidateLink("nope999");
await redis.close();
await pool.end();