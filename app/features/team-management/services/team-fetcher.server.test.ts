import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import type { User } from '../../../../prisma/generated/client.ts';
import { getSharedServerEnv } from '../../../../servers/environment.server.ts';
import { TeamFetcher } from './team-fetcher.server.ts';

const { APP_URL } = getSharedServerEnv();

describe('TeamFetcher', () => {
  let user: User;

  beforeEach(async () => {
    user = await userFactory();
  });

  describe('get', () => {
    it('returns team belonging to user', async () => {
      await teamFactory({ members: [user], attributes: { name: 'My team 1', slug: 'my-team1' } });
      const team = await teamFactory({ owners: [user], attributes: { name: 'My team 2', slug: 'my-team2' } });

      const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
      const myTeam = await TeamFetcher.for(authorizedTeam).get();

      expect(myTeam).toEqual({
        id: team.id,
        name: 'My team 2',
        slug: 'my-team2',
        userRole: 'OWNER',
        invitationLink: `${APP_URL}/invite/team/${team.invitationCode}`,
      });
    });

    it('does not return the invitation link if the user is reviewer', async () => {
      const team = await teamFactory({ reviewers: [user] });

      const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
      const myTeam = await TeamFetcher.for(authorizedTeam).get();

      expect(myTeam.invitationLink).toBe(undefined);
    });
  });
});
