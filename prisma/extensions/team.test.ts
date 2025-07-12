import { getSharedServerEnv } from 'servers/environment.server.ts';
import { teamFactory } from 'tests/factories/team.ts';

const env = getSharedServerEnv();

describe('Team', () => {
  describe('Team#invitationLink', () => {
    it('returns the invitation link', async () => {
      const team = await teamFactory();

      expect(team.invitationLink).toBe(`${env.APP_URL}/invite/team/${team.invitationCode}`);
    });
  });
});
