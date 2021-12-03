import { EventVisibility } from '@prisma/client';
import { addDays } from 'date-fns';
import { setupDatabase } from 'tests/db-helpers';
import { buildEvent } from 'tests/factories/events';
import { buildLoaderRoute } from 'tests/remix-helpers';
import { searchEvents } from './search-events.server';

describe('Search events', () => {
  setupDatabase();

  it('returns incoming events sorted by cfp start date by default', async () => {
    const event1 = await buildEvent({ cfpStart: new Date() });
    const event2 = await buildEvent({ cfpStart: addDays(new Date(), 1) });

    const route = buildLoaderRoute('/search')
    const data = await searchEvents(route);

    expect(data.results.length).toBe(2);
    expect(data.results.map((e) => e.slug)).toEqual([event2.slug, event1.slug]);
  });

  it('returns only public events', async () => {
    const event = await buildEvent({ cfpStart: new Date() });
    await buildEvent({ cfpStart: new Date(), visibility: EventVisibility.PRIVATE });

    const route = buildLoaderRoute('/search')
    const data = await searchEvents(route);

    expect(data.results.length).toBe(1);
    expect(data.results.map((e) => e.slug)).toEqual([event.slug]);
  });

  it('search by event name (insensitive)', async () => {
    const event = await buildEvent({ name: 'Devfest Nantes', cfpStart: new Date() });
    await buildEvent({ name: 'Devoxx France', cfpStart: new Date() });

    const route = buildLoaderRoute('/search?terms=devfest')
    const data = await searchEvents(route);

    expect(data.results.length).toBe(1);
    expect(data.results.map((e) => e.slug)).toEqual([event.slug]);
  });

  it('return event data', async () => {
    const event = await buildEvent({ name: 'Devfest Nantes', cfpStart: new Date() });

    const route = buildLoaderRoute('/search')
    const data = await searchEvents(route);

    expect(data.results[0]).toEqual({
      slug: event.slug,
      name: event.name,
      type: event.type,
      address: event.address,
      cfpStart: event.cfpStart?.toISOString(),
      cfpEnd: undefined,
      cfpState: 'CLOSED',
    });
  });
});
