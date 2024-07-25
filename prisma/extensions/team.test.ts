import { teamFactory } from 'tests/factories/team.ts';

describe('Team', () => {
  describe('Team#invitationLink', () => {
    it('returns the invitation link', async () => {
      const team = await teamFactory();

      expect(team.invitationLink).toBe(`http://127.0.0.1:3000/invite/team/${team.invitationCode}`);
    });
  });
});
