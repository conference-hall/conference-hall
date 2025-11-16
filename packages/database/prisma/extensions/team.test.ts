import { getSharedServerEnv } from '../../../shared/src/environment/environment.ts';
import { teamFactory } from '../../tests/factories/team.ts';

const { APP_URL } = getSharedServerEnv();

describe('Team', () => {
  describe('Team#invitationLink', () => {
    it('returns the invitation link', async () => {
      const team = await teamFactory();

      expect(team.invitationLink).toBe(`${APP_URL}/invite/team/${team.invitationCode}`);
    });
  });
});
