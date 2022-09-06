import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { EventNotFoundError } from '../errors';
import { getEvent } from './event.server';

describe('#getEvent', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns the event for organizer', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user] });
    const event = await eventFactory({
      attributes: {
        name: 'Awesome event',
        slug: 'event',
        visibility: 'PUBLIC',
      },
      traits: ['conference-cfp-open'],
      organization,
    });

    const result = await getEvent(event.slug, user.id);

    expect(result).toEqual({
      name: event.name,
      slug: event.slug,
      type: event.type,
      visibility: event.visibility,
      cfpStart: event.cfpStart?.toUTCString(),
      cfpEnd: event.cfpEnd?.toUTCString(),
      cfpState: 'OPENED',
    });
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const event = await eventFactory();
    await expect(getEvent(event.slug, user.id)).rejects.toThrowError(EventNotFoundError);
  });
});
