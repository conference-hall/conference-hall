import type { Redis } from 'ioredis';
import type { CacheLayer } from './cache-layer.ts';
import { getRedisClient } from './redis.server.ts';

const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

interface RedisCacheOptions {
  prefix?: string;
  ttl?: number;
  persistent?: boolean;
  client?: Redis;
}

export class RedisCacheLayer implements CacheLayer {
  private client: Redis;
  private prefix: string;
  private ttl: number;
  private persistent: boolean;

  constructor(options: RedisCacheOptions = {}) {
    this.client = options.client || getRedisClient();
    this.prefix = options.prefix || '';
    this.ttl = options.ttl || ONE_WEEK_IN_SECONDS;
    this.persistent = options.persistent || false;
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
      if (this.persistent) {
        await this.client.set(prefixedKey, JSON.stringify(value));
      } else {
        await this.client.set(prefixedKey, JSON.stringify(value), 'EX', this.ttl);
      }
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

  async keys(pattern: string): Promise<string[]> {
    const prefixedPattern = this.getPrefixedKey(pattern);
    try {
      const keys = await this.client.keys(prefixedPattern);
      return keys.map((key) => key.replace(this.prefix, ''));
    } catch (error) {
      console.error(`Failed to get keys with pattern ${prefixedPattern} from Redis:`, error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.keys('*');
      if (keys.length > 0) {
        await this.client.del(keys.map((key) => this.getPrefixedKey(key)));
      }
    } catch (error) {
      console.error('Failed to clear Redis cache:', error);
    }
  }

  private getPrefixedKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}
