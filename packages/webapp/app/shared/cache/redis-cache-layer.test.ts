import type { Redis } from 'ioredis';
import { RedisCacheLayer } from './redis-cache-layer.ts';

describe('RedisCacheLayer', () => {
  let cache: RedisCacheLayer;

  const redisMock = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
  };

  beforeEach(() => {
    cache = new RedisCacheLayer({ prefix: 'test:', client: redisMock as unknown as Redis });
  });

  it('gets a value from cache', async () => {
    const value = { foo: 'bar' };
    redisMock.get.mockResolvedValue(JSON.stringify(value));

    const result = await cache.get('key');

    expect(redisMock.get).toHaveBeenCalledWith('test:key');
    expect(result).toEqual(value);
  });

  it('fetchs and set a value if not in cache', async () => {
    const value = { foo: 'bar' };
    redisMock.get.mockResolvedValue(null);
    const fetchCallback = vi.fn().mockResolvedValue(value);

    const result = await cache.get('key', fetchCallback);

    expect(redisMock.get).toHaveBeenCalledWith('test:key');
    expect(fetchCallback).toHaveBeenCalled();
    expect(redisMock.set).toHaveBeenCalledWith('test:key', JSON.stringify(value), 'EX', 604800);
    expect(result).toEqual(value);
  });

  it('sets a value in cache with default TTL', async () => {
    const value = { foo: 'bar' };

    await cache.set('key', value);

    expect(redisMock.set).toHaveBeenCalledWith('test:key', JSON.stringify(value), 'EX', 604800);
  });

  it('sets a value in cache with custom TTL', async () => {
    const value = { foo: 'bar' };
    const ttl = 3600; // 1 hour
    cache = new RedisCacheLayer({ prefix: 'test:', ttl, client: redisMock as unknown as Redis });

    await cache.set('key', value);

    expect(redisMock.set).toHaveBeenCalledWith('test:key', JSON.stringify(value), 'EX', ttl);
  });

  it('sets a value in cache with persistent option', async () => {
    const value = { foo: 'bar' };
    cache = new RedisCacheLayer({ prefix: 'test:', persistent: true, client: redisMock as unknown as Redis });

    await cache.set('key', value);

    expect(redisMock.set).toHaveBeenCalledWith('test:key', JSON.stringify(value));
  });

  it('deletes a value from cache', async () => {
    await cache.del('key');

    expect(redisMock.del).toHaveBeenCalledWith('test:key');
  });

  it('gets keys matching a pattern', async () => {
    redisMock.keys.mockResolvedValue(['test:user:1', 'test:user:2']);

    const result = await cache.keys('user:*');

    expect(redisMock.keys).toHaveBeenCalledWith('test:user:*');
    expect(result).toEqual(['user:1', 'user:2']);
  });

  it('clears all values from cache', async () => {
    redisMock.keys.mockResolvedValue(['test:key1', 'test:key2', 'test:key3']);

    await cache.clear();

    expect(redisMock.keys).toHaveBeenCalledWith('test:*');
    expect(redisMock.del).toHaveBeenCalledWith(['test:key1', 'test:key2', 'test:key3']);
  });

  it('clears cache when no keys exist', async () => {
    redisMock.keys.mockResolvedValue([]);

    await cache.clear();

    expect(redisMock.keys).toHaveBeenCalledWith('test:*');
    expect(redisMock.del).not.toHaveBeenCalled();
  });
});
