import { MemoryCacheLayer } from '../cache/memory-cache-layer.ts';
import { FlagsStorage } from './flags-storage.ts';

describe('FlagsStorage', () => {
  let storage: FlagsStorage;
  let cache: MemoryCacheLayer;

  beforeEach(async () => {
    cache = new MemoryCacheLayer();
    storage = new FlagsStorage(cache);
  });

  afterEach(async () => {
    await cache.clear();
  });

  it('should get value from db', async () => {
    await cache.set('testKey', 'testValue');

    const value = await storage.getValue('testKey');

    expect(value).toBe('testValue');
  });

  it('should add value in db', async () => {
    await storage.setValue('newKey', 'newValue');

    const dbValue = await storage.getValue('newKey');
    expect(dbValue).toBe('newValue');
  });

  it('should update value in db', async () => {
    await storage.setValue('testKey', 'testValue');

    await storage.setValue('testKey', 'newValue');

    const dbValue = await storage.getValue('testKey');
    expect(dbValue).toBe('newValue');
  });

  it('should delete value from db', async () => {
    await storage.setValue('testKey', 'testValue');

    await storage.deleteValue('testKey');

    const dbValue = await storage.getValue('testKey');
    expect(dbValue).toBeNull();
  });

  it('should get all values from db', async () => {
    await storage.setValue('testKey', 'testValue');
    await storage.setValue('testKey2', 'testValue2');

    const values = await storage.getAllValues();

    expect(values).toEqual({ testKey: 'testValue', testKey2: 'testValue2' });
  });
});
