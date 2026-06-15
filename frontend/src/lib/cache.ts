const CACHE_PREFIX = 'astronova:';
const DEFAULT_TTL = 6 * 60 * 60 * 1000; // 6 hours

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

function isAvailable(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function getCached<T>(key: string): T | null {
  if (!isAvailable()) return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function setCached<T>(key: string, data: T, ttlMs = DEFAULT_TTL): void {
  if (!isAvailable()) return;
  try {
    const entry: CacheEntry<T> = { data, expiry: Date.now() + ttlMs };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

export function invalidateCache(key: string): void {
  if (!isAvailable()) return;
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch {
    // silently fail
  }
}

export function clearAllCache(): void {
  if (!isAvailable()) return;
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  } catch {
    // silently fail
  }
}

export function getCacheSize(): number {
  if (!isAvailable()) return 0;
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    return keys.length;
  } catch {
    return 0;
  }
}
