import { parseFilters } from './search';

describe('#parseFilters', () => {
  it('returns valid filters', async () => {
    const params = new URLSearchParams({ query: 'foo', type: 'all', cfp: 'incoming' });
    const result = await parseFilters(params);
    expect(result).toEqual({ query: 'foo', type: 'all', cfp: 'incoming' });
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

  it('returns undefined when incorrect "cfp" filter', async () => {
    const params = new URLSearchParams({ cfp: 'XXX' });
    const result = await parseFilters(params);
    expect(result.cfp).toBe(undefined);
  });
});
