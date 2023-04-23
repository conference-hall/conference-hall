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
    const event1 = await eventFactory({ attributes: { name: 'A' }, organization, traits: ['conference'] });
    const event2 = await eventFactory({ attributes: { name: 'B' }, organization, traits: ['meetup'] });

    const organization2 = await organizationFactory({ owners: [user] });
    await eventFactory({ traits: ['conference-cfp-open'], organization: organization2 });

    const events = await listEvents('my-orga', user.id, false);
    expect(events).toEqual([
      {
        name: event1.name,
        slug: event1.slug,
        type: event1.type,
        bannerUrl: event1.bannerUrl,
        cfpStart: event1.cfpStart?.toUTCString(),
        cfpEnd: event1.cfpEnd?.toUTCString(),
        cfpState: 'CLOSED',
      },
      {
        name: event2.name,
        slug: event2.slug,
        type: event2.type,
        bannerUrl: event2.bannerUrl,
        cfpStart: event2.cfpStart?.toUTCString(),
        cfpEnd: event2.cfpEnd?.toUTCString(),
        cfpState: 'CLOSED',
      },
    ]);
  });

  it('returns organization archived events', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user], attributes: { slug: 'my-orga' } });
    const event = await eventFactory({ attributes: { name: 'B' }, organization, traits: ['meetup', 'archived'] });
    await eventFactory({ attributes: { name: 'A' }, organization, traits: ['conference'] });

    const events = await listEvents('my-orga', user.id, true);
    expect(events).toEqual([
      {
        name: event.name,
        slug: event.slug,
        type: event.type,
        bannerUrl: event.bannerUrl,
        cfpStart: event.cfpStart?.toUTCString(),
        cfpEnd: event.cfpEnd?.toUTCString(),
        cfpState: 'CLOSED',
      },
    ]);
  });

  it('returns nothing when user is not member of the organization', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ attributes: { slug: 'my-orga' } });
    await eventFactory({ organization });

    const events = await listEvents('my-orga', user.id, false);
    expect(events).toEqual([]);
  });
});
