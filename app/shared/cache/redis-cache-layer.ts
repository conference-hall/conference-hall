import type { Redis } from 'ioredis';
import type { CacheLayer } from './cache-layer.ts';
import { getRedisClient } from './redis.server.ts';

const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

export class RedisCacheLayer implements CacheLayer {
  private client: Redis;
  private prefix: string;
  private ttl: number;

  constructor(prefix = '', ttl: number = ONE_WEEK_IN_SECONDS, client = getRedisClient()) {
    this.client = client;
    this.prefix = prefix;
    this.ttl = ttl;
  }

  async get(key: string, fetchCallback?: () => Promise<any>): Promise<any> {
    const prefixedKey = this.getPrefixedKey(key);
    try {
      let value = await this.client.get(prefixedKey);
      if (value) {
        return JSON.parse(value);
      } else if (fetchCallback) {
        value = await fetchCallback();
        if (value !== null && value !== undefined) {
          await this.set(key, value);
        }
        return value;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get key ${prefixedKey} from Redis:`, error);
      return null;
    }
  }

  async set(key: string, value: any) {
    const prefixedKey = this.getPrefixedKey(key);
    try {
      await this.client.set(prefixedKey, JSON.stringify(value), 'EX', this.ttl);
    } catch (error) {
      console.error(`Failed to set key ${prefixedKey} in Redis:`, error);
    }
  }

  async del(key: string) {
    const prefixedKey = this.getPrefixedKey(key);
    try {
      await this.client.del(prefixedKey);
    } catch (error) {
      console.error(`Failed to delete key ${prefixedKey} from Redis:`, error);
    }
  }

  private getPrefixedKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}
