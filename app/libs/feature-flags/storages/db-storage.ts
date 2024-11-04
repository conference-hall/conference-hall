import { db } from '../../../../prisma/db.server.ts';
import type { CacheLayer } from '../../cache/cache-layer.ts';
import { RedisCacheLayer } from '../../cache/redis-cache-layer.ts';
import type { FlagConfig } from '../types.ts';
import type { FlagsStorage } from './flags-storage.ts';

export class DbStorage implements FlagsStorage {
  private cache: CacheLayer;

  constructor(cache: CacheLayer = new RedisCacheLayer('flag:')) {
    this.cache = cache;
  }

  async getValue(key: string, _config: FlagConfig): Promise<any> {
    return this.cache.get(key, async () => {
      const flag = await db.featureFlag.findUnique({ where: { key } });
      return flag?.value;
    });
  }

  async getValues(keys: string[], _config: FlagConfig): Promise<Record<string, any>> {
    const values: Record<string, any> = {};
    const missingKeys: string[] = [];

    for (const key of keys) {
      const value = await this.cache.get(key, async () => {
        missingKeys.push(key);
        return null;
      });
      if (value !== null) {
        values[key] = value;
      }
    }

    if (missingKeys.length > 0) {
      const flags = await db.featureFlag.findMany({ where: { key: { in: missingKeys } } });
      for (const flag of flags) {
        values[flag.key] = flag.value;
        await this.cache.set(flag.key, flag.value);
      }
    }

    return values;
  }

  async getAllValues(): Promise<Record<string, any>> {
    const flags = await db.featureFlag.findMany();
    const values: Record<string, any> = {};
    for (const flag of flags) {
      values[flag.key] = flag.value;
    }
    return values;
  }

  async setValue(key: string, value: any, _config: FlagConfig) {
    await db.featureFlag.upsert({ where: { key }, update: { value }, create: { key, value } });
    await this.cache.set(key, value);
  }

  async deleteValue(key: string) {
    await db.featureFlag.delete({ where: { key } });
    await this.cache.del(key);
  }
}
