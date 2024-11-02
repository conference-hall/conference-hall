import type Redis from 'ioredis';
import { RedisCacheLayer } from './redis-cache-layer';

describe('RedisCacheLayer', () => {
  let cache: RedisCacheLayer;

  const redisMock = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  };

  beforeEach(() => {
    cache = new RedisCacheLayer('test:', undefined, redisMock as unknown as Redis);
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
    cache = new RedisCacheLayer('test:', ttl, redisMock as unknown as Redis);

    await cache.set('key', value);

    expect(redisMock.set).toHaveBeenCalledWith('test:key', JSON.stringify(value), 'EX', ttl);
  });

  it('deletes a value from cache', async () => {
    await cache.del('key');

    expect(redisMock.del).toHaveBeenCalledWith('test:key');
  });
});
