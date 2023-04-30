import { disconnectDB, resetDB } from 'tests/db-helpers';
import { organizationFactory } from 'tests/factories/organization';
import { userFactory } from 'tests/factories/users';
import { listMembers } from './list-members.server';
import { ForbiddenOperationError } from '~/libs/errors';

describe('#listMembers', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns organization members', async () => {
    const owner = await userFactory({
      traits: ['clark-kent'],
      attributes: { id: '1', picture: 'https://img.com/a.png' },
    });
    const member = await userFactory({
      traits: ['bruce-wayne'],
      attributes: { id: '2', picture: 'https://img.com/b.png' },
    });
    const reviewer = await userFactory({
      traits: ['peter-parker'],
      attributes: { id: '3', picture: 'https://img.com/c.png' },
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
      { id: '2', name: 'Bruce Wayne', role: 'MEMBER', picture: 'https://img.com/b.png' },
      { id: '1', name: 'Clark Kent', role: 'OWNER', picture: 'https://img.com/a.png' },
      { id: '3', name: 'Peter Parker', role: 'REVIEWER', picture: 'https://img.com/c.png' },
    ]);
  });

  it('returns nothing when user is not owner of the organization', async () => {
    const user = await userFactory();
    const owner = await userFactory();
    const organization = await organizationFactory({ owners: [owner], attributes: { slug: 'my-orga' } });

    await expect(listMembers(organization.slug, user.id)).rejects.toThrowError(ForbiddenOperationError);
  });
});
