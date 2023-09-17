import { parsePage } from './pagination.ts';

describe('#parsePage', () => {
  it('returns valid page', async () => {
    const params = new URLSearchParams({ page: '1' });
    const result = parsePage(params);
    expect(result).toBe(1);
  });

  it('returns page 1 when page number invalid', async () => {
    const params = new URLSearchParams({ query: 'XXX' });
    const result = parsePage(params);
    expect(result).toBe(1);
  });
});
