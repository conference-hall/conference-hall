import { MemoryCacheLayer } from './memory-cache-layer';

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
});
