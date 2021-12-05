import { setupDatabase } from 'tests/db-helpers';
import { buildEvent } from 'tests/factories/events';
import { buildLoaderRoute } from 'tests/remix-helpers';
import { buildCategory } from 'tests/factories/categories';
import { buildFormat } from 'tests/factories/formats';
import { getEventDescription } from './load-event.server';

describe('Get event description', () => {
  setupDatabase();

  it('returns event description data', async () => {
    const event = await buildEvent();
    const format = await buildFormat({ eventId: event.id });
    const category = await buildCategory({ eventId: event.id });

    const route = buildLoaderRoute(`/event/${event.slug}`, { eventSlug: event.slug });
    const data = await getEventDescription(route);

    expect(data).toEqual({
      description: event.description,
      type: event.type,
      bannerUrl: event.bannerUrl,
      websiteUrl: event.websiteUrl,
      contactEmail: event.contactEmail,
      codeOfConductUrl: event.codeOfConductUrl,
      cfpStart: event.cfpStart?.toISOString(),
      cfpEnd: event.cfpEnd?.toISOString(),
      cfpState: 'CLOSED',
      formats: [{ id: format.id, name: format.name, description: null }],
      categories: [{ id: category.id, name: category.name, description: null }],
    });
  });

  it('throws a 404 error when event is not found', async () => {
    expect.assertions(1);
    try {
      const route = buildLoaderRoute('/event/not-found', { eventSlug: 'not-found' });
      await getEventDescription(route)
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(404);
      }
    }
  });
});
