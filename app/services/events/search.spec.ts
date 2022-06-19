import { disconnectDB, resetDB } from '../../../tests/db-helpers';
import { EventFactory } from '../../../tests/factories/events';
import { searchEvents, validateFilters, validatePage } from './search.server';

describe('#searchEvents', () => {
  beforeEach(() => resetDB());
  afterAll(() => disconnectDB());

  it('should return the default response', async () => {
    await EventFactory('conference-cfp-open').create({
      name: 'conf-1',
      slug: 'conf-1',
      address: 'address-1',
    });

    const result = await searchEvents({ type: 'conference', cfp: 'incoming' });

    expect(result).toEqual({
      filters: { type: 'conference', cfp: 'incoming' },
      pagination: { current: 1, total: 1 },
      results: [{ 
        slug: 'conf-1',
        name: 'conf-1',
        type: 'CONFERENCE',
        address: 'address-1',
        cfpState: 'OPENED',
      }],
    });
  });


  it('should return all open and future events by default', async () => {
    await EventFactory('conference-cfp-open').create({ name: 'conf-1' });
    await EventFactory('conference-cfp-future').create({ name: 'conf-2' });
    await EventFactory('meetup-cfp-open').create({ name: 'conf-3' });
    await EventFactory('meetup-cfp-close').create();
    await EventFactory('conference-cfp-past').create();

    const result = await searchEvents({});

    expect(result.pagination.current).toBe(1);
    expect(result.pagination.total).toBe(1);
    expect(result.results.length).toBe(3);

    const names = result.results.map((e) => e.name).sort();
    expect(names).toEqual(['conf-1', 'conf-2', 'conf-3']);

    const cfpStates = result.results.map((e) => e.cfpState).sort();
    expect(cfpStates).toEqual(['CLOSED', 'OPENED', 'OPENED']);
  });

  it('should not return private events', async () => {
    await EventFactory('conference-cfp-open').create({ name: 'conf-1' });
    await EventFactory('conference-cfp-open', 'private').create();

    const result = await searchEvents({});

    expect(result.results.length).toBe(1);
    expect(result.results[0].name).toBe('conf-1');
  });

  it('should not return archived events', async () => {
    await EventFactory('conference-cfp-open').create({ name: 'conf-1' });
    await EventFactory('conference-cfp-open', 'archived').create();

    const result = await searchEvents({});

    expect(result.results.length).toBe(1);
    expect(result.results[0].name).toBe('conf-1');
  });

  it('should sort events by cfp start date and name', async () => {
    await EventFactory('conference-cfp-open').create({ name: 'conf-1', cfpStart: '2020-01-01T00:00:00.000Z' });
    await EventFactory('conference-cfp-open').create({ name: 'conf-2', cfpStart: '2020-02-01T00:00:00.000Z' });
    await EventFactory('conference-cfp-open').create({ name: 'conf-3', cfpStart: '2020-02-01T00:00:00.000Z' });

    const result = await searchEvents({});

    expect(result.results.length).toBe(3);

    const names = result.results.map((e) => e.name);
    expect(names).toEqual(['conf-2', 'conf-3', 'conf-1']);
  });

  it('should filter by name (insensitive)', async () => {
    await EventFactory('conference-cfp-open').create({ name: 'expected-conf' });
    await EventFactory('conference-cfp-open').create({ name: 'not-returned' });

    const result = await searchEvents({ terms: 'ExpEctEd' });

    expect(result.results.length).toBe(1);
    expect(result.results[0].name).toBe('expected-conf');
    expect(result.filters.terms).toBe('ExpEctEd');
  });

  it('should filter by past CFP only', async () => {
    await EventFactory('conference-cfp-open').create({ name: 'conf-1' });
    await EventFactory('conference-cfp-past').create({ name: 'conf-2' });

    const result = await searchEvents({ cfp: 'past' });

    expect(result.results.length).toBe(1);
    expect(result.results[0].name).toBe('conf-2');
    expect(result.filters.cfp).toBe('past');
  });

  it('should filter by incoming CFP only', async () => {
    await EventFactory('conference-cfp-open').create({ name: 'conf-1' });
    await EventFactory('conference-cfp-past').create({ name: 'conf-2' });

    const result = await searchEvents({ cfp: 'incoming' });

    expect(result.results.length).toBe(1);
    expect(result.results[0].name).toBe('conf-1');
    expect(result.filters.cfp).toBe('incoming');
  });

  it('should filter by conference type', async () => {
    await EventFactory('conference-cfp-open').create({ name: 'conf-1' });
    await EventFactory('meetup-cfp-open').create({ name: 'conf-2' });

    const result = await searchEvents({ type: 'conference' });

    expect(result.results.length).toBe(1);
    expect(result.results[0].name).toBe('conf-1');
    expect(result.filters.type).toBe('conference');
  });

  it('should filter by meetup type', async () => {
    await EventFactory('conference-cfp-open').create({ name: 'conf-1' });
    await EventFactory('meetup-cfp-open').create({ name: 'conf-2' });

    const result = await searchEvents({ type: 'meetup' });

    expect(result.results.length).toBe(1);
    expect(result.results[0].name).toBe('conf-2');
    expect(result.filters.type).toBe('meetup');
  });

  it('should return the given page', async () => {
    await Promise.all(
      Array.from({ length: 36 }).map(() => EventFactory('meetup-cfp-open').create())
    );

    const result = await searchEvents({}, 2);
    expect(result.results.length).toBe(12);
    expect(result.pagination.current).toBe(2);
    expect(result.pagination.total).toBe(3);

    const result2 = await searchEvents({}, -1);
    expect(result2.results.length).toBe(12);
    expect(result2.pagination.current).toBe(1);

    const result3 = await searchEvents({}, 10);
    expect(result3.results.length).toBe(12);
    expect(result3.pagination.current).toBe(3);
  });
});

describe('#validateFilters', () => {
  it('should return valid filters', () => {
    const params = new URLSearchParams({ terms: 'foo', type: 'all', cfp: 'incoming' })
    const result = validateFilters(params);
    expect(result).toEqual({ terms: 'foo', type: 'all', cfp: 'incoming' });
  })

  it('should trim "terms" filter', () => {
    const params = new URLSearchParams({ terms: '  foo  ' })
    const result = validateFilters(params);
    expect(result.terms).toBe('foo');
  })

  it('should returns undefined when incorrect "type" filter', () => {
    const params = new URLSearchParams({ type: 'XXX' })
    const result = validateFilters(params);
    expect(result.type).toBe(undefined);
  })

  it('should returns undefined when incorrect "cfp" filter', () => {
    const params = new URLSearchParams({ cfp: 'XXX' })
    const result = validateFilters(params);
    expect(result.cfp).toBe(undefined);
  })
});

describe('#validatePage', () => {
  it('should return valid page', () => {
    const params = new URLSearchParams({ page: '1' })
    const result = validatePage(params);
    expect(result).toBe(1);
  })

  it('should return page 1 when page number invalid', () => {
    const params = new URLSearchParams({ terms: 'XXX' })
    const result = validatePage(params);
    expect(result).toBe(1);
  })
});

