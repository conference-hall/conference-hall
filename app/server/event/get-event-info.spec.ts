import { setupDatabase } from 'tests/db-helpers';
import { buildEvent } from 'tests/factories/events';
import { buildLoaderRoute } from 'tests/remix-helpers';
import { getEventInfo } from './get-event-info.server';

describe('Get event information', () => {
  setupDatabase();

  it('returns event info', async () => {
    const event = await buildEvent();

    const route = buildLoaderRoute(`/event/${event.id}`, { slug: event.id });
    const data = await getEventInfo(route);

    expect(data).toEqual({
      id: event.id,
      name: event.name,
      type: event.type,
      address: event.address,
      conferenceStart: event.conferenceStart?.toISOString(),
      conferenceEnd: event.conferenceEnd?.toISOString(),
    });
  });

  it('throws a 404 error when event is not found', async () => {
    expect.assertions(1);
    try {
      const route = buildLoaderRoute('/event/not-found', { slug: 'not-found' });
      await getEventInfo(route)
    } catch (error) {
      if (error instanceof Response) {
        expect(error.status).toEqual(404);
      }
    }
  });
});
