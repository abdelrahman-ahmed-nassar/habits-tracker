/**
 * Simple in-memory cache utility for analytics data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number; // Time in milliseconds when this entry expires
}

class AnalyticsCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (optional, defaults to 5 minutes)
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const timestamp = Date.now();
    const expiry = timestamp + ttl;

    this.cache.set(key, {
      data,
      timestamp,
      expiry,
    });
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns Cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key Cache key
   * @returns Whether key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache keys matching a prefix
   * @param prefix Key prefix to match
   * @returns Array of matching keys
   */
  getKeysByPrefix(prefix: string): string[] {
    const now = Date.now();
    const keys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (key.startsWith(prefix) && entry.expiry > now) {
        keys.push(key);
      }
    }

    return keys;
  }

  /**
   * Invalidate all cache entries with keys matching a prefix
   * @param prefix Key prefix to match
   */
  invalidateByPrefix(prefix: string): void {
    const keys = this.getKeysByPrefix(prefix);
    keys.forEach((key) => this.cache.delete(key));
  }

  /**
   * Get or set cache entry - returns cached value if exists, otherwise
   * computes and caches the result of the factory function
   * @param key Cache key
   * @param factory Function to produce value if not in cache
   * @param ttl Time to live in milliseconds
   * @returns Cached or computed value
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cachedValue = this.get<T>(key);

    if (cachedValue !== null) {
      return cachedValue;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }
}

// Export singleton instance
export const analyticsCache = new AnalyticsCache();
