import { setupDatabase } from 'tests/db-helpers';
import { buildEvent } from 'tests/factories/events';
import { buildLoaderRoute } from 'tests/remix-helpers';
import { getEventDescription } from './get-event-description.server';

describe('Get event description', () => {
  setupDatabase();

  it('returns incoming events sorted by cfp start date by default', async () => {
    const event = await buildEvent();

    const route = buildLoaderRoute(`/event/${event.id}`, { slug: event.id });
    const data = await getEventDescription(route);

    expect(data.id).toEqual(event.id);
  });
});
