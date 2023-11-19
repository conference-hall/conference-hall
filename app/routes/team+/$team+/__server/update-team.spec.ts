import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { ForbiddenOperationError } from '~/libs/errors.ts';

import { updateTeam } from './update-team.server.ts';

describe('#updateTeam', () => {
  it('updates the team', async () => {
    const user = await userFactory();
    const team = await teamFactory({
      attributes: { name: 'Hello world', slug: 'hello-world' },
      owners: [user],
    });
    const result = await updateTeam(team.slug, user.id, {
      name: 'Hello world updated',
      slug: 'hello-world-updated',
    });
    expect(result.slug).toEqual('hello-world-updated');
  });

  it('throws an error if user is not owner', async () => {
    const user = await userFactory();
    const team = await teamFactory({ members: [user] });

    await expect(updateTeam(team.slug, user.id, { name: 'name', slug: 'slug' })).rejects.toThrowError(
      ForbiddenOperationError,
    );
  });

  it('returns an error if the slug already exists', async () => {
    const user = await userFactory();
    const team = await teamFactory({ attributes: { slug: 'hello-world-1' }, owners: [user] });
    await teamFactory({ attributes: { slug: 'hello-world-2' }, owners: [user] });
    const result = await updateTeam(team.slug, user.id, {
      name: 'Hello world',
      slug: 'hello-world-2',
    });
    expect(result?.fieldErrors?.slug).toEqual('This URL already exists, please try another one.');
  });
});