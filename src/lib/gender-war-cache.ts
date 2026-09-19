/**
 * Gender War Cache Tier (T023 / FR-416 / SC-401)
 *
 * In-memory cache layer with TTL (default 5 minutes) and instant invalidation.
 * Provides sub-millisecond response times (<1ms) for Gender War aggregate and
 * leaderboard queries without requiring external Redis infrastructure or network overhead.
 *
 * ponytail: An in-memory cache layer with TTL and invalidation provides sub-millisecond
 * response times without requiring an external Redis dependency. If a multi-instance
 * Redis cluster is deployed, this cache layer can be backed by a Redis client.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes (matches ISR revalidation cycle)
const memoryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Retrieves an item from the cache. Returns null if missing or expired.
 */
export function getCachedItem<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * Stores an item in the cache with a specified TTL (in milliseconds).
 */
export function setCachedItem<T>(key: string, data: T, ttlMs = CACHE_TTL_MS): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Invalidates all cached Gender War data.
 * Called when aggregates are recomputed or admin configuration updates occur (FR-416).
 */
export function invalidateGenderWarCache(): void {
  memoryCache.clear();
}

/**
 * Generates standard cache keys for Gender War data slices.
 */
export const GenderWarCacheKeys = {
  aggregate: (gender: string, timeWindow: string, periodId: string | null = null) =>
    `gw:agg:${gender}:${timeWindow}:${periodId ?? ''}`,
  leaderboard: (gender: string, offset: number, limit: number) =>
    `gw:lb:${gender}:${offset}:${limit}`,
  fullResponse: (timeWindow: string, periodId: string | null = null) =>
    `gw:full:${timeWindow}:${periodId ?? ''}`,
};
