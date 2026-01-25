import { teamFactory } from 'tests/factories/team.ts';
import { getSharedServerEnv } from '../../servers/environment.server.ts';

const { APP_URL } = getSharedServerEnv();

describe('Team', () => {
  describe('Team#invitationLink', () => {
    it('returns the invitation link', async () => {
      const team = await teamFactory();

      expect(team.invitationLink).toBe(`${APP_URL}/invite/team/${team.invitationCode}`);
    });
  });
});
