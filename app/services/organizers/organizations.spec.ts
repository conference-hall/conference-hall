import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { OrganizationNotFoundError } from '../errors';
import { getOrganization, getOrganizationEvents, getOrganizations } from './organizations';

describe('#getOrganizations', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('return user organizations', async () => {
    const user = await userFactory();
    await organizationFactory({ owners: [user], attributes: { name: 'My orga owner', slug: 'orga-owner' } });
    await organizationFactory({ members: [user], attributes: { name: 'My orga member', slug: 'orga-member' } });
    await organizationFactory({ reviewers: [user], attributes: { name: 'My orga reviewer', slug: 'orga-reviewer' } });

    const organizations = await getOrganizations(user.id);

    expect(organizations).toEqual([
      { name: 'My orga member', slug: 'orga-member', role: 'MEMBER' },
      { name: 'My orga owner', slug: 'orga-owner', role: 'OWNER' },
      { name: 'My orga reviewer', slug: 'orga-reviewer', role: 'REVIEWER' },
    ]);
  });
});

describe('#getOrganization', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns organization belonging to user', async () => {
    const user = await userFactory();
    await organizationFactory({ owners: [user], attributes: { name: 'My orga 1', slug: 'my-orga1' } });
    await organizationFactory({ members: [user], attributes: { name: 'My orga 2', slug: 'my-orga2' } });

    const organizations = await getOrganization('my-orga2', user.id);

    expect(organizations).toEqual({ name: 'My orga 2', slug: 'my-orga2', role: 'MEMBER' });
  });

  it('throws an error when user is not member of the organization', async () => {
    const user = await userFactory();
    await organizationFactory({ attributes: { name: 'My orga', slug: 'my-orga' } });
    await expect(getOrganization('my-orga', user.id)).rejects.toThrowError(OrganizationNotFoundError);
  });

  it('throws an error when organization not found', async () => {
    const user = await userFactory();
    await expect(getOrganization('XXX', user.id)).rejects.toThrowError(OrganizationNotFoundError);
  });
});

describe('#getOrganizationEvents', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns organization events', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ owners: [user], attributes: { slug: 'my-orga' } });
    await eventFactory({ attributes: { name: 'Event 1', slug: 'event1' }, organization });
    await eventFactory({ attributes: { name: 'Event 2', slug: 'event2' }, organization });

    const organization2 = await organizationFactory({ owners: [user] });
    await eventFactory({ traits: ['conference-cfp-open'], organization: organization2 });

    const events = await getOrganizationEvents('my-orga', user.id);
    expect(events).toEqual([
      { name: 'Event 1', slug: 'event1', type: 'CONFERENCE' },
      { name: 'Event 2', slug: 'event2', type: 'CONFERENCE' },
    ]);
  });

  it('returns nothing when user is not member of the organization', async () => {
    const user = await userFactory();
    const organization = await organizationFactory({ attributes: { slug: 'my-orga' } });
    await eventFactory({ organization });

    const events = await getOrganizationEvents('my-orga', user.id);
    expect(events).toEqual([]);
  });
});
