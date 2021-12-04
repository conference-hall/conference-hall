import { setupDatabase } from 'tests/db-helpers';
import { buildEvent } from 'tests/factories/events';
import { buildLoaderRoute } from 'tests/remix-helpers';
import { getEventDescription } from './get-event-description.server';

describe('Get event description', () => {
  setupDatabase();

  it('returns incoming events sorted by cfp start date by default', async () => {
    const event = await buildEvent();

    const route = buildLoaderRoute(`/event/${event.slug}`, { eventSlug: event.slug });
    const data = await getEventDescription(route);

    expect(data).toEqual({
      slug: event.slug,
      name: event.name,
      description: event.description,
      type: event.type,
      address: event.address,
      bannerUrl: event.bannerUrl,
      websiteUrl: event.websiteUrl,
      contactEmail: event.contactEmail,
      codeOfConductUrl: event.codeOfConductUrl,
      conferenceStart: event.conferenceStart?.toISOString(),
      conferenceEnd: event.conferenceEnd?.toISOString(),
      cfpStart: event.cfpStart?.toISOString(),
      cfpEnd: event.cfpEnd?.toISOString(),
      cfpState: 'CLOSED',
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
