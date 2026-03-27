export type CacheStrategy = "lru" | "lfu" | "fifo" | "ttl";

export interface CacheEntry<T> {
  key: string;
  value: T;
  size: number;
  createdAt: number;
  accessedAt: number;
  accessCount: number;
  ttl?: number;
}

export interface CacheConfig {
  maxSize: number;
  maxEntries: number;
  strategy: CacheStrategy;
  defaultTTL?: number;
  persistToStorage: boolean;
  storageKey?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  entries: number;
  hitRate: number;
}

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxEntries: 1000,
  strategy: "lru",
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  persistToStorage: false,
  storageKey: "jixia_cache",
};

export class CacheService<T = unknown> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    entries: 0,
    hitRate: 0,
  };
  private observers: Set<(event: CacheEvent<T>) => void> = new Set();
  private cleanupTimer: number | null = null;

  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    if (this.config.persistToStorage) {
      this.loadFromStorage();
    }
    this.startCleanupTimer();
  }

  private loadFromStorage(): void {
    if (!this.config.storageKey) return;

    try {
      const data = localStorage.getItem(this.config.storageKey);
      if (data) {
        const entries = JSON.parse(data);
        for (const [key, entry] of Object.entries(entries)) {
          this.cache.set(key, entry as CacheEntry<T>);
          this.stats.size += (entry as CacheEntry<T>).size;
        }
        this.stats.entries = this.cache.size;
      }
    } catch (e) {
      console.warn("Failed to load cache from storage");
    }
  }

  private saveToStorage(): void {
    if (!this.config.persistToStorage || !this.config.storageKey) return;

    try {
      const data = Object.fromEntries(this.cache);
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save cache to storage");
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = window.setInterval(() => {
      this.cleanup();
    }, 60000); // Clean up every minute
  }

  private stopCleanupTimer(): void {
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  set(key: string, value: T, ttl?: number): boolean {
    const size = this.estimateSize(value);

    // Check if we need to evict entries
    while (
      this.stats.size + size > this.config.maxSize ||
      this.cache.size >= this.config.maxEntries
    ) {
      if (!this.evict()) {
        return false;
      }
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      size,
      createdAt: Date.now(),
      accessedAt: Date.now(),
      accessCount: 0,
      ttl: ttl || this.config.defaultTTL,
    };

    const existing = this.cache.get(key);
    if (existing) {
      this.stats.size -= existing.size;
    }

    this.cache.set(key, entry);
    this.stats.size += size;
    this.stats.entries = this.cache.size;

    this.saveToStorage();
    this.notifyObservers({ type: "set", key, entry });

    return true;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return undefined;
    }

    // Check TTL
    if (entry.ttl && Date.now() - entry.createdAt > entry.ttl) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return undefined;
    }

    // Update access info
    entry.accessedAt = Date.now();
    entry.accessCount++;

    this.stats.hits++;
    this.updateHitRate();
    this.notifyObservers({ type: "get", key, entry });

    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check TTL
    if (entry.ttl && Date.now() - entry.createdAt > entry.ttl) {
      this.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.stats.size -= entry.size;
    this.stats.entries = this.cache.size;

    this.saveToStorage();
    this.notifyObservers({ type: "delete", key, entry });

    return true;
  }

  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.entries = 0;

    if (this.config.storageKey) {
      localStorage.removeItem(this.config.storageKey);
    }

    this.notifyObservers({ type: "clear", key: "", entry: null as any });
  }

  private evict(): boolean {
    if (this.cache.size === 0) return false;

    let keyToEvict: string | null = null;

    switch (this.config.strategy) {
      case "lru":
        keyToEvict = this.getLRUKey();
        break;
      case "lfu":
        keyToEvict = this.getLFUKey();
        break;
      case "fifo":
        keyToEvict = this.getFIFOKey();
        break;
      case "ttl":
        keyToEvict = this.getTTLKey();
        break;
    }

    if (keyToEvict) {
      this.delete(keyToEvict);
      this.stats.evictions++;
      return true;
    }

    return false;
  }

  private getLRUKey(): string | null {
    let oldest: CacheEntry<T> | null = null;
    let oldestKey: string | null = null;

    for (const [key, entry] of this.cache) {
      if (!oldest || entry.accessedAt < oldest.accessedAt) {
        oldest = entry;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private getLFUKey(): string | null {
    let leastUsed: CacheEntry<T> | null = null;
    let leastUsedKey: string | null = null;

    for (const [key, entry] of this.cache) {
      if (!leastUsed || entry.accessCount < leastUsed.accessCount) {
        leastUsed = entry;
        leastUsedKey = key;
      }
    }

    return leastUsedKey;
  }

  private getFIFOKey(): string | null {
    let oldest: CacheEntry<T> | null = null;
    let oldestKey: string | null = null;

    for (const [key, entry] of this.cache) {
      if (!oldest || entry.createdAt < oldest.createdAt) {
        oldest = entry;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private getTTLKey(): string | null {
    let shortestTTL: CacheEntry<T> | null = null;
    let shortestTTLKey: string | null = null;

    for (const [key, entry] of this.cache) {
      if (!entry.ttl) continue;

      const remaining = entry.createdAt + entry.ttl - Date.now();
      if (!shortestTTL || remaining < (shortestTTL.ttl || 0)) {
        shortestTTL = entry;
        shortestTTLKey = key;
      }
    }

    return shortestTTLKey;
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (entry.ttl && now - entry.createdAt > entry.ttl) {
        toDelete.push(key);
      }
    }

    for (const key of toDelete) {
      this.delete(key);
    }
  }

  private estimateSize(value: T): number {
    try {
      return JSON.stringify(value).length * 2; // Rough estimate in bytes
    } catch {
      return 1024; // Default 1KB
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? Math.round((this.stats.hits / total) * 100) : 0;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  values(): T[] {
    return Array.from(this.cache.values()).map((entry) => entry.value);
  }

  entries(): Array<[string, T]> {
    return Array.from(this.cache.entries()).map(([key, entry]) => [key, entry.value]);
  }

  size(): number {
    return this.cache.size;
  }

  subscribe(callback: (event: CacheEvent<T>) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(event: CacheEvent<T>): void {
    this.observers.forEach((callback) => callback(event));
  }

  destroy(): void {
    this.stopCleanupTimer();
    this.observers.clear();
    this.saveToStorage();
  }
}

export interface CacheEvent<T> {
  type: "set" | "get" | "delete" | "clear";
  key: string;
  entry: CacheEntry<T>;
}

// Create default cache instance
export const cacheService = new CacheService();
