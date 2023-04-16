import { disconnectDB, resetDB } from 'tests/db-helpers';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { listMembers } from './list-members.server';

describe('#listMembers', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns organization members', async () => {
    const owner = await userFactory({
      traits: ['clark-kent'],
      attributes: { id: '1', photoURL: 'https://img.com/a.png' },
    });
    const member = await userFactory({
      traits: ['bruce-wayne'],
      attributes: { id: '2', photoURL: 'https://img.com/b.png' },
    });
    const reviewer = await userFactory({
      traits: ['peter-parker'],
      attributes: { id: '3', photoURL: 'https://img.com/c.png' },
    });
    const organization = await organizationFactory({
      owners: [owner],
      members: [member],
      reviewers: [reviewer],
      attributes: { slug: 'my-orga' },
    });
    const other = await userFactory();
    await organizationFactory({ owners: [other] });

    const members = await listMembers(organization.slug, owner.id);
    expect(members).toEqual([
      { id: '2', name: 'Bruce Wayne', role: 'MEMBER', photoURL: 'https://img.com/b.png' },
      { id: '1', name: 'Clark Kent', role: 'OWNER', photoURL: 'https://img.com/a.png' },
      { id: '3', name: 'Peter Parker', role: 'REVIEWER', photoURL: 'https://img.com/c.png' },
    ]);
  });

  it('returns nothing when user is not member of the organization', async () => {
    const user = await userFactory();
    const owner = await userFactory();
    const organization = await organizationFactory({ owners: [owner], attributes: { slug: 'my-orga' } });

    const events = await listMembers(organization.slug, user.id);
    expect(events).toEqual([]);
  });
});
