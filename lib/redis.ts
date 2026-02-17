import Redis from "ioredis";

const redisUrl = process.env.UPSTASH_REDIS_URL;

export const redis = redisUrl
  ? new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      tls: redisUrl.startsWith("rediss://") ? {} : undefined
    })
  : null;

// Redis is optional in local/dev. If it's misconfigured or temporarily unavailable,
// fail open and let callers fall back to the database.
if (redis) {
  redis.on("error", () => {
    // Intentionally swallow connection noise to avoid crashing request handlers.
  });
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 120): Promise<void> {
  if (!redis) return;

  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // No-op: cache failures should not break request flow.
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // No-op: cache invalidation failures should not break request flow.
  }
}
