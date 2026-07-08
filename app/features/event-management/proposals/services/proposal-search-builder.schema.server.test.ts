import { parseUrlFilters } from './proposal-search-builder.schema.server.ts';

describe('parseUrlFilters', () => {
  it('parses valid filters', () => {
    const url = new URL('https://example.com/proposals?query=react&status=accepted&confirmation=confirmed');
    const result = parseUrlFilters(url);

    expect(result).toEqual({ query: 'react', status: 'accepted', confirmation: 'confirmed' });
  });

  it('parses reviews as an array of values', () => {
    const url = new URL('https://example.com/proposals?reviews=positive&reviews=negative');
    const result = parseUrlFilters(url);

    expect(result).toEqual({ reviews: ['positive', 'negative'] });
  });

  it('returns empty filters for URL without search parameters', () => {
    const url = new URL('https://example.com/proposals');
    const result = parseUrlFilters(url);

    expect(result).toEqual({});
  });

  it('drops an invalid status value but keeps the other filters', () => {
    const url = new URL('https://example.com/proposals?query=react&status=confirmed');
    const result = parseUrlFilters(url);

    expect(result).toEqual({ query: 'react' });
  });

  it('drops an invalid confirmation value but keeps the other filters', () => {
    const url = new URL('https://example.com/proposals?status=accepted&confirmation=unknown');
    const result = parseUrlFilters(url);

    expect(result).toEqual({ status: 'accepted' });
  });

  it('drops the reviews filter when one of its values is invalid', () => {
    const url = new URL('https://example.com/proposals?reviews=positive&reviews=invalid&status=pending');
    const result = parseUrlFilters(url);

    expect(result).toEqual({ status: 'pending' });
  });

  it('drops an invalid sort or order value independently', () => {
    const url = new URL('https://example.com/proposals?sort=invalid&order=desc');
    const result = parseUrlFilters(url);

    expect(result).toEqual({ order: 'desc' });
  });
});
