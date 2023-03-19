import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { listEvents } from './list-events.server';

describe('#listEvents', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns organization events', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user], attributes: { slug: 'my-orga' } });
    await eventFactory({ attributes: { name: 'Event 1', slug: 'event1' }, organization, traits: ['conference'] });
    await eventFactory({ attributes: { name: 'Event 2', slug: 'event2' }, organization, traits: ['meetup'] });

    const organization2 = await organizationFactory({ owners: [user] });
    await eventFactory({ traits: ['conference-cfp-open'], organization: organization2 });

    const events = await listEvents('my-orga', user.id);
    expect(events).toEqual([
      { name: 'Event 1', slug: 'event1', type: 'CONFERENCE' },
      { name: 'Event 2', slug: 'event2', type: 'MEETUP' },
    ]);
  });

  it('returns nothing when user is not member of the organization', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ attributes: { slug: 'my-orga' } });
    await eventFactory({ organization });

    const events = await listEvents('my-orga', user.id);
    expect(events).toEqual([]);
  });
});
