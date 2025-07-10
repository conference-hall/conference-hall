import type { CacheLayer } from './cache-layer.ts';

export class MemoryCacheLayer implements CacheLayer {
  private cache: Map<string, any>;

  constructor() {
    this.cache = new Map();
  }

  async get(key: string, fetchCallback?: () => Promise<any>): Promise<any> {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    if (fetchCallback) {
      const value = await fetchCallback();
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  async set(key: string, value: any): Promise<void> {
    this.cache.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Array.from(this.cache.keys()).filter((key) => regex.test(key));
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}
