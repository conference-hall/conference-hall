import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { config } from '~/libs/config.ts';
import { TeamNotFoundError } from '~/libs/errors.ts';

import { getTeam } from './get-team.server.ts';

describe('#getOrganization', () => {
  it('returns team belonging to user', async () => {
    const user = await userFactory();
    await teamFactory({ owners: [user], attributes: { name: 'My team 1', slug: 'my-team1' } });
    const team = await teamFactory({ members: [user], attributes: { name: 'My team 2', slug: 'my-team2' } });

    const teams = await getTeam('my-team2', user.id);

    expect(teams).toEqual({
      id: team.id,
      name: 'My team 2',
      slug: 'my-team2',
      role: 'MEMBER',
      invitationLink: `${config.appUrl}/invite/team/${team.invitationCode}`,
    });
  });

  it('throws an error when user is not member of the team', async () => {
    const user = await userFactory();
    await teamFactory({ attributes: { name: 'My team', slug: 'my-team' } });
    await expect(getTeam('my-team', user.id)).rejects.toThrowError(TeamNotFoundError);
  });

  it('throws an error when team not found', async () => {
    const user = await userFactory();
    await expect(getTeam('XXX', user.id)).rejects.toThrowError(TeamNotFoundError);
  });
});
