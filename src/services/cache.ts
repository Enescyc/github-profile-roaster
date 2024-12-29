interface CachedData<T> {
  data: T;
  timestamp: number;
}

const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutes

export class CacheService {
  private static PREFIX = 'gh_roaster_';

  static set<T>(key: string, data: T): void {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(this.PREFIX + key, JSON.stringify(cacheData));
  }

  static get<T>(key: string): T | null {
    const cached = localStorage.getItem(this.PREFIX + key);
    if (!cached) return null;

    const { data, timestamp }: CachedData<T> = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      this.remove(key);
      return null;
    }

    return data;
  }

  static remove(key: string): void {
    localStorage.removeItem(this.PREFIX + key);
  }

  static clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
} 