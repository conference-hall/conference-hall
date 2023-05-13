import { parseFilters } from './search';

describe('#parseFilters', () => {
  it('returns valid filters', async () => {
    const params = new URLSearchParams({ query: 'foo', type: 'all' });
    const result = await parseFilters(params);
    expect(result).toEqual({ query: 'foo', type: 'all' });
  });

  it('trims "query" filter', async () => {
    const params = new URLSearchParams({ query: '  foo  ' });
    const result = await parseFilters(params);
    expect(result.query).toBe('foo');
  });

  it('returns undefined when incorrect "type" filter', async () => {
    const params = new URLSearchParams({ type: 'XXX' });
    const result = await parseFilters(params);
    expect(result.type).toBe(undefined);
  });

  it('reset filters', async () => {
    const params = new URLSearchParams({ query: '', type: '' });
    const result = await parseFilters(params);
    expect(result.query).toBe(undefined);
    expect(result.type).toBe(undefined);
  });
});
