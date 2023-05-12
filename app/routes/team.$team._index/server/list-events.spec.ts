import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';
import { listEvents } from './list-events.server';
import { ForbiddenOperationError } from '~/libs/errors';

describe('#listEvents', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns team events', async () => {
    const user = await userFactory();
    const team = await teamFactory({ owners: [user], attributes: { slug: 'my-team' } });
    const event1 = await eventFactory({ attributes: { name: 'A' }, team, traits: ['conference'] });
    const event2 = await eventFactory({ attributes: { name: 'B' }, team, traits: ['meetup'] });

    const team2 = await teamFactory({ owners: [user] });
    await eventFactory({ traits: ['conference-cfp-open'], team: team2 });

    const events = await listEvents('my-team', user.id, false);
    expect(events).toEqual([
      {
        name: event1.name,
        slug: event1.slug,
        type: event1.type,
        logo: event1.logo,
        cfpStart: event1.cfpStart?.toUTCString(),
        cfpEnd: event1.cfpEnd?.toUTCString(),
        cfpState: 'CLOSED',
      },
      {
        name: event2.name,
        slug: event2.slug,
        type: event2.type,
        logo: event2.logo,
        cfpStart: event2.cfpStart?.toUTCString(),
        cfpEnd: event2.cfpEnd?.toUTCString(),
        cfpState: 'CLOSED',
      },
    ]);
  });

  it('returns team archived events', async () => {
    const user = await userFactory();
    const team = await teamFactory({ owners: [user], attributes: { slug: 'my-team' } });
    const event = await eventFactory({ attributes: { name: 'B' }, team, traits: ['meetup', 'archived'] });
    await eventFactory({ attributes: { name: 'A' }, team, traits: ['conference'] });

    const events = await listEvents('my-team', user.id, true);
    expect(events).toEqual([
      {
        name: event.name,
        slug: event.slug,
        type: event.type,
        logo: event.logo,
        cfpStart: event.cfpStart?.toUTCString(),
        cfpEnd: event.cfpEnd?.toUTCString(),
        cfpState: 'CLOSED',
      },
    ]);
  });

  it('throws an error when user not member of team event', async () => {
    const user = await userFactory();
    const team = await teamFactory({ attributes: { slug: 'my-team' } });
    await eventFactory({ team });

    await expect(listEvents('my-team', user.id, false)).rejects.toThrowError(ForbiddenOperationError);
  });
});
