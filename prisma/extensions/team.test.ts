import { teamFactory } from 'tests/factories/team.ts';

describe('Team', () => {
  describe('Team#invitationLink', () => {
    it('returns the invitation link', async () => {
      const team = await teamFactory();

      expect(team.invitationLink).toBe(`${process.env.APP_URL}/invite/team/${team.invitationCode}`);
    });
  });
});
