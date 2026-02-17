# Redis (Upstash) Setup Guide

1. Create an Upstash Redis database.
2. Copy TLS URL (`rediss://...`) and set `UPSTASH_REDIS_URL`.
3. Keep REST env vars for Vercel dashboard consistency:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
4. Cache keys used:
- `products:all`
- `category:all`
- `featured:all`
- invalidation pattern: `products:*`, `category:*`, `featured:*`
5. Rate limiting uses Redis key prefix: `rate:<ip>`.
