import { eventFactory } from '@conference-hall/database/tests/factories/events.ts';
import { parseUrlFilters } from './event-search.schema.server.ts';
import { EventsSearch } from './event-search.server.ts';

describe('EventsSearch', () => {
  describe('search', () => {
    it('returns the default response', async () => {
      const event = await eventFactory({
        traits: ['conference-cfp-open'],
        attributes: { name: 'conf-1', slug: 'conf-1', location: 'location-1' },
      });

      const result = await EventsSearch.with({ type: 'conference' }).search();

      expect(result).toEqual({
        filters: { type: 'conference' },
        pagination: { current: 1, total: 1 },
        results: [
          {
            slug: 'conf-1',
            name: 'conf-1',
            type: 'CONFERENCE',
            location: 'location-1',
            cfpState: 'OPENED',
            timezone: event.timezone,
            cfpStart: event.cfpStart,
            cfpEnd: event.cfpEnd,
            logoUrl: event.logoUrl,
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

      const result = await EventsSearch.with({}).search();

      expect(result.pagination.current).toBe(1);
      expect(result.pagination.total).toBe(1);
      expect(result.results.length).toBe(3);

      const names = result.results.map((e) => e.name).sort();
      expect(names).toEqual(['conf-1', 'conf-2', 'conf-3']);

      const cfpStates = result.results.map((e) => e.cfpState).sort();
      expect(cfpStates).toEqual(['CLOSED', 'OPENED', 'OPENED']);
    });

    it('doesnt returns private events', async () => {
      await eventFactory({
        traits: ['conference-cfp-open'],
        attributes: { name: 'conf-1' },
      });
      await eventFactory({ traits: ['conference-cfp-open', 'private'] });

      const result = await EventsSearch.with({}).search();

      expect(result.results.length).toBe(1);
      expect(result.results[0].name).toBe('conf-1');
    });

    it('doesnt returns archived events', async () => {
      await eventFactory({
        traits: ['conference-cfp-open'],
        attributes: { name: 'conf-1' },
      });
      await eventFactory({ traits: ['conference-cfp-open', 'archived'] });

      const result = await EventsSearch.with({}).search();

      expect(result.results.length).toBe(1);
      expect(result.results[0].name).toBe('conf-1');
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

      const result = await EventsSearch.with({}).search();

      expect(result.results.length).toBe(3);

      const names = result.results.map((e) => e.name);
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

      const result = await EventsSearch.with({ query: 'ExpEctEd' }).search();

      expect(result.results.length).toBe(1);
      expect(result.results[0].name).toBe('expected-conf');
      expect(result.filters.query).toBe('ExpEctEd');
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

      const result = await EventsSearch.with({}).search();

      expect(result.results.length).toBe(1);
      expect(result.results[0].name).toBe('conf-1');
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

      const result = await EventsSearch.with({ type: 'conference' }).search();

      expect(result.results.length).toBe(1);
      expect(result.results[0].name).toBe('conf-1');
      expect(result.filters.type).toBe('conference');
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

      const result = await EventsSearch.with({ type: 'meetup' }).search();

      expect(result.results.length).toBe(1);
      expect(result.results[0].name).toBe('conf-2');
      expect(result.filters.type).toBe('meetup');
    });

    it('returns the given page', async () => {
      await Promise.all(Array.from({ length: 36 }).map(() => eventFactory({ traits: ['meetup-cfp-open'] })));

      const result = await EventsSearch.with({}, 2).search();
      expect(result.results.length).toBe(12);
      expect(result.pagination.current).toBe(2);
      expect(result.pagination.total).toBe(3);

      const result2 = await EventsSearch.with({}, -1).search();
      expect(result2.results.length).toBe(12);
      expect(result2.pagination.current).toBe(1);

      const result3 = await EventsSearch.with({}, 10).search();
      expect(result3.results.length).toBe(12);
      expect(result3.pagination.current).toBe(3);
    });
  });
});

describe('EventsSearch schemas', () => {
  describe('parseUrlFilters', () => {
    it('returns valid filters', async () => {
      const url = 'http://localhost/?query=foo&type=all';
      const result = parseUrlFilters(url);
      expect(result).toEqual({ query: 'foo', type: 'all' });
    });

    it('trims "query" filter', async () => {
      const url = 'http://localhost/?query=foo';
      const result = parseUrlFilters(url);
      expect(result.query).toBe('foo');
    });

    it('returns undefined when incorrect "type" filter', async () => {
      const url = 'http://localhost/?type=foo';
      const result = parseUrlFilters(url);
      expect(result.type).toBe(undefined);
    });

    it('reset filters', async () => {
      const url = 'http://localhost';
      const result = parseUrlFilters(url);
      expect(result.query).toBe(undefined);
      expect(result.type).toBe(undefined);
    });
  });
});
