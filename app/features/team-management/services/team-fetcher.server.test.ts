import type { User } from '@prisma/client';
import { getSharedServerEnv } from 'servers/environment.server.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { TeamFetcher } from './team-fetcher.server.ts';

const env = getSharedServerEnv();

describe('TeamFetcher', () => {
  let user: User;

  beforeEach(async () => {
    user = await userFactory();
  });

  describe('get', () => {
    it('returns team belonging to user', async () => {
      await teamFactory({ members: [user], attributes: { name: 'My team 1', slug: 'my-team1' } });
      const team = await teamFactory({ owners: [user], attributes: { name: 'My team 2', slug: 'my-team2' } });

      const myTeam = await TeamFetcher.for(user.id, team.slug).get();

      expect(myTeam).toEqual({
        id: team.id,
        name: 'My team 2',
        slug: 'my-team2',
        invitationLink: `${env.APP_URL}/invite/team/${team.invitationCode}`,
        userRole: 'OWNER',
        userPermissions: expect.objectContaining({ canEditTeam: true }),
      });
    });

    it('does not return the invitation link if the user is reviewer', async () => {
      const team = await teamFactory({ reviewers: [user] });

      const myTeam = await TeamFetcher.for(user.id, team.slug).get();

      expect(myTeam.invitationLink).toBe(undefined);
    });

    it('throws an error when user is not member of the team', async () => {
      const team = await teamFactory({ attributes: { name: 'My team', slug: 'my-team' } });
      await expect(TeamFetcher.for(user.id, team.slug).get()).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error when team not found', async () => {
      await expect(TeamFetcher.for(user.id, 'XXX').get()).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
