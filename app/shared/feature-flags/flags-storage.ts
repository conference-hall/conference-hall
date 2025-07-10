import type { CacheLayer } from '../cache/cache-layer.ts';
import { RedisCacheLayer } from '../cache/redis-cache-layer.ts';

export class FlagsStorage {
  private cache: CacheLayer;

  constructor(cache: CacheLayer = new RedisCacheLayer({ prefix: 'flag:', persistent: true })) {
    this.cache = cache;
  }

  async getValue(key: string): Promise<any> {
    return this.cache.get(key);
  }

  async getValues(keys: string[]): Promise<Record<string, any>> {
    const values: Record<string, any> = {};
    for (const key of keys) {
      values[key] = await this.cache.get(key);
    }
    return values;
  }

  async getAllValues(): Promise<Record<string, any>> {
    const keys = await this.cache.keys('*');
    return this.getValues(keys);
  }

  async setValue(key: string, value: any) {
    await this.cache.set(key, value);
  }

  async deleteValue(key: string) {
    await this.cache.del(key);
  }

  async clear() {
    this.cache.clear();
  }
}
