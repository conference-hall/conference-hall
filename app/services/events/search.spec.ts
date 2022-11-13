import { resetDB, disconnectDB } from '../../../tests/db-helpers';
import { eventFactory } from '../../../tests/factories/events';
import { searchEvents } from './search.server';

describe('#searchEvents', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the default response', async () => {
    const event = await eventFactory({
      traits: ['conference-cfp-open'],
      attributes: { name: 'conf-1', slug: 'conf-1', address: 'address-1' },
    });

    const result = await searchEvents({ type: 'conference', cfp: 'incoming' });

    expect(result.success && result.data).toEqual({
      filters: { type: 'conference', cfp: 'incoming' },
      pagination: { current: 1, total: 1 },
      results: [
        {
          slug: 'conf-1',
          name: 'conf-1',
          type: 'CONFERENCE',
          address: 'address-1',
          cfpState: 'OPENED',
          cfpStart: event.cfpStart?.toUTCString(),
          cfpEnd: event.cfpEnd?.toUTCString(),
        },
      ],
    });
  });

  it('returns all open and future events by default', async () => {
    await eventFactory({
      traits: ['conference-cfp-open'],
      attributes: { name: 'conf-1' },
    });
    await eventFactory({
      traits: ['conference-cfp-future'],
      attributes: { name: 'conf-2' },
    });
    await eventFactory({
      traits: ['meetup-cfp-open'],
      attributes: { name: 'conf-3' },
    });
    await eventFactory({ traits: ['meetup-cfp-close'] });
    await eventFactory({ traits: ['conference-cfp-past'] });

    const result = await searchEvents({});
    if (!result.success) throw Error('Search error');

    expect(result.data.pagination.current).toBe(1);
    expect(result.data.pagination.total).toBe(1);
    expect(result.data.results.length).toBe(3);

    const names = result.data.results.map((e) => e.name).sort();
    expect(names).toEqual(['conf-1', 'conf-2', 'conf-3']);

    const cfpStates = result.data.results.map((e) => e.cfpState).sort();
    expect(cfpStates).toEqual(['CLOSED', 'OPENED', 'OPENED']);
  });

  it('doesnt returns private events', async () => {
    await eventFactory({
      traits: ['conference-cfp-open'],
      attributes: { name: 'conf-1' },
    });
    await eventFactory({ traits: ['conference-cfp-open', 'private'] });

    const result = await searchEvents({});
    if (!result.success) throw Error('Search error');

    expect(result.data.results.length).toBe(1);
    expect(result.data.results[0].name).toBe('conf-1');
  });

  it('doesnt returns archived events', async () => {
    await eventFactory({
      traits: ['conference-cfp-open'],
      attributes: { name: 'conf-1' },
    });
    await eventFactory({ traits: ['conference-cfp-open', 'archived'] });

    const result = await searchEvents({});
    if (!result.success) throw Error('Search error');

    expect(result.data.results.length).toBe(1);
    expect(result.data.results[0].name).toBe('conf-1');
  });

  it('sorts events by cfp start date and name', async () => {
    await eventFactory({
      traits: ['conference-cfp-open'],
      attributes: { name: 'conf-1', cfpStart: '2020-01-01T00:00:00.000Z' },
    });
    await eventFactory({
      traits: ['conference-cfp-open'],
      attributes: { name: 'conf-2', cfpStart: '2020-02-01T00:00:00.000Z' },
    });
    await eventFactory({
      traits: ['conference-cfp-open'],
      attributes: { name: 'conf-3', cfpStart: '2020-02-01T00:00:00.000Z' },
    });

    const result = await searchEvents({});
    if (!result.success) throw Error('Search error');

    expect(result.data.results.length).toBe(3);

    const names = result.data.results.map((e) => e.name);
    expect(names).toEqual(['conf-2', 'conf-3', 'conf-1']);
  });

  it('filters by name (insensitive)', async () => {
    await eventFactory({
      traits: ['conference-cfp-open'],
      attributes: { name: 'expected-conf' },
    });
    await eventFactory({
      traits: ['conference-cfp-open'],
      attributes: { name: 'not-returned' },
    });

    const result = await searchEvents({ query: 'ExpEctEd' });
    if (!result.success) throw Error('Search error');

    expect(result.data.results.length).toBe(1);
    expect(result.data.results[0].name).toBe('expected-conf');
    expect(result.data.filters.query).toBe('ExpEctEd');
  });

  it('filters by past CFP only', async () => {
    await eventFactory({
      traits: ['conference-cfp-open'],
      attributes: { name: 'conf-1' },
    });
    await eventFactory({
      traits: ['conference-cfp-past'],
      attributes: { name: 'conf-2' },
    });

    const result = await searchEvents({ cfp: 'past' });
    if (!result.success) throw Error('Search error');

    expect(result.data.results.length).toBe(1);
    expect(result.data.results[0].name).toBe('conf-2');
    expect(result.data.filters.cfp).toBe('past');
  });

  it('filters by incoming CFP only', async () => {
    await eventFactory({
      traits: ['conference-cfp-open'],
      attributes: { name: 'conf-1' },
    });
    await eventFactory({
      traits: ['conference-cfp-past'],
      attributes: { name: 'conf-2' },
    });

    const result = await searchEvents({ cfp: 'incoming' });
    if (!result.success) throw Error('Search error');

    expect(result.data.results.length).toBe(1);
    expect(result.data.results[0].name).toBe('conf-1');
    expect(result.data.filters.cfp).toBe('incoming');
  });

  it('filters by conference type', async () => {
    await eventFactory({
      traits: ['conference-cfp-open'],
      attributes: { name: 'conf-1' },
    });
    await eventFactory({
      traits: ['meetup-cfp-open'],
      attributes: { name: 'conf-2' },
    });

    const result = await searchEvents({ type: 'conference' });
    if (!result.success) throw Error('Search error');

    expect(result.data.results.length).toBe(1);
    expect(result.data.results[0].name).toBe('conf-1');
    expect(result.data.filters.type).toBe('conference');
  });

  it('filters by meetup type', async () => {
    await eventFactory({
      traits: ['conference-cfp-open'],
      attributes: { name: 'conf-1' },
    });
    await eventFactory({
      traits: ['meetup-cfp-open'],
      attributes: { name: 'conf-2' },
    });

    const result = await searchEvents({ type: 'meetup' });
    if (!result.success) throw Error('Search error');

    expect(result.data.results.length).toBe(1);
    expect(result.data.results[0].name).toBe('conf-2');
    expect(result.data.filters.type).toBe('meetup');
  });

  it('returns the given page', async () => {
    await Promise.all(Array.from({ length: 36 }).map(() => eventFactory({ traits: ['meetup-cfp-open'] })));

    const result = await searchEvents({ page: 2 });
    if (!result.success) throw Error('Search error 1');

    expect(result.data.results.length).toBe(12);
    expect(result.data.pagination.current).toBe(2);
    expect(result.data.pagination.total).toBe(3);

    const result2 = await searchEvents({ page: -1 });
    if (!result2.success) throw Error('Search error 2');

    expect(result2.data.results.length).toBe(12);
    expect(result2.data.pagination.current).toBe(1);

    const result3 = await searchEvents({ page: 10 });
    if (!result3.success) throw Error('Search error 3');

    expect(result3.data.results.length).toBe(12);
    expect(result3.data.pagination.current).toBe(3);
  });
});
