// Simple in-memory cache with TTL
interface CacheEntry<T> {
  data: T
  timestamp: number
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private defaultTTL: number = 60000 // 1 minute in milliseconds

  get<T>(key: string, ttl?: number): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const age = Date.now() - entry.timestamp
    const maxAge = ttl || this.defaultTTL

    if (age > maxAge) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultTTL) {
        this.cache.delete(key)
      }
    }
  }
}

export const cache = new SimpleCache()

// Cleanup expired cache entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => cache.cleanup(), 5 * 60 * 1000)
}
