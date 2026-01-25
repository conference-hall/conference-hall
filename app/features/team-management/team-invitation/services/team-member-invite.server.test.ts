import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { InvitationNotFoundError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { TeamMemberInvite } from './team-member-invite.server.ts';

describe('TeamMemberInvite', () => {
  describe('#check', () => {
    it('returns the team for an invitation code', async () => {
      const owner = await userFactory();
      const team = await teamFactory({ owners: [owner] });

      const result = await TeamMemberInvite.with(team.invitationCode).check();

      expect(result.id).toEqual(team.id);
    });

    it('returns throws an error when invitation code does not exist', async () => {
      await expect(TeamMemberInvite.with('XXX').check()).rejects.toThrowError(InvitationNotFoundError);
    });
  });

  describe('#addMember', () => {
    it('adds the member as reviewer to the team', async () => {
      const owner = await userFactory();
      const member = await userFactory();
      const team = await teamFactory({ owners: [owner] });

      const result = await TeamMemberInvite.with(team.invitationCode).addMember(member.id);

      const orgaMember = await db.teamMember.findUnique({
        where: { memberId_teamId: { memberId: member.id, teamId: team.id } },
      });

      expect(orgaMember?.role).toBe('REVIEWER');
      expect(result?.slug).toBe(team.slug);
    });

    it('returns throws an error when invitation code does not exist', async () => {
      const user = await userFactory();
      await expect(TeamMemberInvite.with('XXX').addMember(user.id)).rejects.toThrowError(InvitationNotFoundError);
    });
  });
});
