import { createClient } from "redis";

const { REDIS_URL } = process.env;

// Fail fast, same idea as DATABASE_URL in db.ts.
if (!REDIS_URL) {
  throw new Error("REDIS_URL is not set. Copy .env.example to .env and fill it in.");
}

export const redis = createClient({
  url: REDIS_URL,
  // If Redis is down, commands fail immediately instead of waiting in a queue.
  // The cache layer treats a failure as a cache miss, so the app keeps working.
  disableOfflineQueue: true,
});

// Without an "error" listener, a Redis problem would crash the whole process.
redis.on("error", (err) => console.error("[redis]", err.message));

// Not awaited on purpose: the app may start even if Redis is not up yet.
// The client keeps retrying in the background.
redis.connect().catch((err) => console.error("[redis] initial connect failed:", err.message));