import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ForbiddenOperationError } from '../errors.server.ts';
import { TeamAuthorization } from './team-authorization.server.ts';

describe('TeamAuthorization', () => {
  describe('#checkMemberPermissions', () => {
    it('returns the member info', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });

      const authorization = new TeamAuthorization(user.id, team.slug);
      const { member, permissions } = await authorization.checkMemberPermissions();

      expect(member.memberId).toEqual(user.id);
      expect(member.teamId).toEqual(team.id);
      expect(member.role).toBe('OWNER');

      expect(permissions.canEditTeam).toBe(true);
    });

    it('returns the member info if allowed the given permission', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });

      const authorization = new TeamAuthorization(user.id, team.slug);
      const { member, permissions } = await authorization.checkMemberPermissions('canEditTeam');

      expect(member.memberId).toEqual(user.id);
      expect(member.teamId).toEqual(team.id);
      expect(member.role).toBe('OWNER');

      expect(permissions.canEditTeam).toBe(true);
    });

    it('throws an error if user role is not in the accepted role list', async () => {
      const user = await userFactory();
      const team = await teamFactory({ members: [user] });

      const authorization = new TeamAuthorization(user.id, team.slug);
      await expect(authorization.checkMemberPermissions('canEditTeam')).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user has access to another team but not the given one', async () => {
      const user = await userFactory();
      const team = await teamFactory();
      await teamFactory({ owners: [user] });

      const authorization = new TeamAuthorization(user.id, team.slug);
      await expect(authorization.checkMemberPermissions('canEditTeam')).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if team does not exist', async () => {
      const user = await userFactory();
      await teamFactory({ owners: [user] });

      const authorization = new TeamAuthorization(user.id, 'XXX');
      await expect(authorization.checkMemberPermissions('canEditTeam')).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
