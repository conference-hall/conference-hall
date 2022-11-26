import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { listOrganizations } from './list-organizations.server';

describe('#listOrganizations', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('return user organizations', async () => {
    const user = await userFactory();
    const user2 = await userFactory();
    await organizationFactory({ owners: [user], attributes: { name: 'My orga owner', slug: 'orga-owner' } });
    await organizationFactory({ members: [user], attributes: { name: 'My orga member', slug: 'orga-member' } });
    await organizationFactory({ reviewers: [user], attributes: { name: 'My orga reviewer', slug: 'orga-reviewer' } });
    await organizationFactory({ owners: [user2], attributes: { name: 'Not orga', slug: 'not-orga' } });

    const organizations = await listOrganizations(user.id);

    expect(organizations).toEqual([
      { name: 'My orga member', slug: 'orga-member', role: 'MEMBER', eventsCount: 0, membersCount: 1 },
      { name: 'My orga owner', slug: 'orga-owner', role: 'OWNER', eventsCount: 0, membersCount: 1 },
      { name: 'My orga reviewer', slug: 'orga-reviewer', role: 'REVIEWER', eventsCount: 0, membersCount: 1 },
    ]);
  });

  it('does not count archived events', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({
      owners: [user],
      attributes: { name: 'My orga owner', slug: 'orga-owner' },
    });
    await eventFactory({ organization });
    await eventFactory({ organization, traits: ['archived'] });

    const organizations = await listOrganizations(user.id);

    expect(organizations).toEqual([
      { name: 'My orga owner', slug: 'orga-owner', role: 'OWNER', eventsCount: 1, membersCount: 1 },
    ]);
  });
});
