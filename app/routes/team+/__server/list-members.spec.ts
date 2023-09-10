import { teamFactory } from 'tests/factories/team';
import { userFactory } from 'tests/factories/users';

import { ForbiddenOperationError } from '~/libs/errors';

import { listMembers } from './list-members.server';

describe('#listMembers', () => {
  it('returns team members and filter them', async () => {
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
    const team = await teamFactory({
      owners: [owner],
      members: [member],
      reviewers: [reviewer],
      attributes: { slug: 'my-team' },
    });
    const other = await userFactory();
    await teamFactory({ owners: [other] });

    const members = await listMembers(team.slug, owner.id, {}, 1);
    expect(members.pagination).toEqual({ current: 1, total: 1 });

    expect(members.results).toEqual([
      { id: '2', name: 'Bruce Wayne', role: 'MEMBER', picture: 'https://img.com/b.png' },
      { id: '1', name: 'Clark Kent', role: 'OWNER', picture: 'https://img.com/a.png' },
      { id: '3', name: 'Peter Parker', role: 'REVIEWER', picture: 'https://img.com/c.png' },
    ]);

    const filtered = await listMembers(team.slug, owner.id, { query: 'kent' }, 1);
    expect(filtered.results).toEqual([
      { id: '1', name: 'Clark Kent', role: 'OWNER', picture: 'https://img.com/a.png' },
    ]);
  });

  it('returns nothing when user is not owner of the team', async () => {
    const user = await userFactory();
    const owner = await userFactory();
    const team = await teamFactory({ owners: [owner], attributes: { slug: 'my-team' } });

    await expect(listMembers(team.slug, user.id, {}, 1)).rejects.toThrowError(ForbiddenOperationError);
  });
});
