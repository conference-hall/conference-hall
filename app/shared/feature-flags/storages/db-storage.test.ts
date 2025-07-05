import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../../prisma/db.server.ts';
import { MemoryCacheLayer } from '../../cache/memory-cache-layer.ts';
import type { FlagConfig } from '../types.ts';
import { DbStorage } from './db-storage.ts';

describe('DbStorage', () => {
  let dbStorage: DbStorage;
  let cache: MemoryCacheLayer;
  const testConfig: FlagConfig = { description: '', type: 'string', defaultValue: 'testValue', tags: [] };

  beforeEach(async () => {
    cache = new MemoryCacheLayer();
    dbStorage = new DbStorage(cache);
    await db.featureFlag.create({ data: { key: 'testKey', value: 'testValue' } });
  });

  afterEach(async () => {
    await db.featureFlag.deleteMany();
  });

  it('should get value from cache if available', async () => {
    const cacheGetSpy = vi.spyOn(cache, 'get');
    await cache.set('testKey', 'testValue');

    const value = await dbStorage.getValue('testKey');

    expect(value).toBe('testValue');
    expect(cacheGetSpy).toHaveBeenCalledWith('testKey', expect.any(Function));
  });

  it('should get value from db if not in cache', async () => {
    const cacheGetSpy = vi.spyOn(cache, 'get');

    const value = await dbStorage.getValue('testKey');

    expect(value).toBe('testValue');
    expect(cacheGetSpy).toHaveBeenCalledWith('testKey', expect.any(Function));
  });

  it('should set value in db and cache', async () => {
    const cacheSetSpy = vi.spyOn(cache, 'set');
    await dbStorage.setValue('newKey', 'newValue', testConfig);

    const dbValue = await db.featureFlag.findUnique({ where: { key: 'newKey' } });
    expect(dbValue?.value).toBe('newValue');

    expect(cacheSetSpy).toHaveBeenCalledWith('newKey', 'newValue');
  });

  it('should delete value from db and cache', async () => {
    const cacheDelSpy = vi.spyOn(cache, 'del');
    await dbStorage.deleteValue('testKey');

    const dbValue = await db.featureFlag.findUnique({ where: { key: 'testKey' } });
    expect(dbValue).toBeNull();

    expect(cacheDelSpy).toHaveBeenCalledWith('testKey');
  });

  it('should get all values from db', async () => {
    await db.featureFlag.create({ data: { key: 'key2', value: 'value2' } });

    const values = await dbStorage.getAllValues();

    expect(values).toEqual({ testKey: 'testValue', key2: 'value2' });
  });

  it('should get multiple values from cache and db', async () => {
    const cacheGetSpy = vi.spyOn(cache, 'get');
    await cache.set('key1', 'value1');
    await db.featureFlag.create({ data: { key: 'key2', value: 'value2' } });

    const values = await dbStorage.getValues(['key1', 'key2']);

    expect(values).toEqual({ key1: 'value1', key2: 'value2' });
    expect(cacheGetSpy).toHaveBeenCalledWith('key1', expect.any(Function));
    expect(cacheGetSpy).toHaveBeenCalledWith('key2', expect.any(Function));
  });
});
