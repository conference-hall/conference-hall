import { MemoryCacheLayer } from './memory-cache-layer.ts';

describe('MemoryCacheLayer', () => {
  let cache: MemoryCacheLayer;

  beforeEach(() => {
    cache = new MemoryCacheLayer();
  });

  it('gets a value from cache', async () => {
    const value = { foo: 'bar' };
    await cache.set('key', value);

    const result = await cache.get('key');

    expect(result).toEqual(value);
  });

  it('fetches and sets a value if not in cache', async () => {
    const value = { foo: 'bar' };
    const fetchCallback = vi.fn().mockResolvedValue(value);

    const result = await cache.get('key', fetchCallback);

    expect(fetchCallback).toHaveBeenCalled();
    expect(result).toEqual(value);
  });

  it('sets a value in cache', async () => {
    const value = { foo: 'bar' };

    await cache.set('key', value);

    const result = await cache.get('key');
    expect(result).toEqual(value);
  });

  it('deletes a value from cache', async () => {
    const value = { foo: 'bar' };
    await cache.set('key', value);

    await cache.del('key');

    const result = await cache.get('key');
    expect(result).toBeNull();
  });

  it('gets keys matching a pattern', async () => {
    await cache.set('user:1', { name: 'John' });
    await cache.set('user:2', { name: 'Jane' });
    await cache.set('post:1', { title: 'Hello' });

    const userKeys = await cache.keys('user:*');
    const postKeys = await cache.keys('post:*');
    const allKeys = await cache.keys('*');

    expect(userKeys).toEqual(['user:1', 'user:2']);
    expect(postKeys).toEqual(['post:1']);
    expect(allKeys).toEqual(['user:1', 'user:2', 'post:1']);
  });

  it('clears all values from cache', async () => {
    await cache.set('key1', { value: 1 });
    await cache.set('key2', { value: 2 });
    await cache.set('key3', { value: 3 });

    await cache.clear();

    const result1 = await cache.get('key1');
    const result2 = await cache.get('key2');
    const result3 = await cache.get('key3');

    expect(result1).toBeNull();
    expect(result2).toBeNull();
    expect(result3).toBeNull();
  });
});
