import { NextRequest } from "next/server";
import { redis } from "./redis";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 100;
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function applyMemoryRateLimit(key: string, max: number, windowSeconds: number) {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const current = memoryStore.get(key);

  if (!current || current.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: Math.max(0, max - 1) };
  }

  current.count += 1;
  memoryStore.set(key, current);
  return {
    success: current.count <= max,
    remaining: Math.max(0, max - current.count)
  };
}

export async function applyRateLimitByKey(key: string, max = MAX_REQUESTS, windowSeconds = WINDOW_SECONDS) {
  if (!redis) return applyMemoryRateLimit(key, max, windowSeconds);

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    return {
      success: count <= max,
      remaining: Math.max(0, max - count)
    };
  } catch {
    // Fall back to in-memory limiter if Redis is unavailable.
    return applyMemoryRateLimit(key, max, windowSeconds);
  }
}

export async function applyRateLimit(request: NextRequest) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown";
  return applyRateLimitByKey(`rate:${ip}`, MAX_REQUESTS, WINDOW_SECONDS);
}
