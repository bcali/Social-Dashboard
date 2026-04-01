import type { SproutReportingRow } from "./social-types";

interface CacheEntry {
  data: SproutReportingRow[];
  timestamp: number;
}

const STALE_MS = 60 * 60 * 1000; // 1 hour — matches worker cache TTL

const cache = new Map<string, CacheEntry>();

/** Returns cached data if exists and not stale, else null. */
export function getCached(key: string): SproutReportingRow[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > STALE_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

/** Stores data in cache with current timestamp. */
export function setCache(key: string, data: SproutReportingRow[]): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/** Builds a deterministic cache key from request parameters. */
export function buildCacheKey(startDate: string, endDate: string, profileIds: string[]): string {
  // Sort profile IDs for deterministic key regardless of input order
  const idsHash = profileIds.slice().sort().join(",");
  return `reporting_${startDate}_${endDate}_${simpleHash(idsHash)}`;
}

/** Simple string hash for cache keys (not cryptographic). */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return (hash >>> 0).toString(36);
}
