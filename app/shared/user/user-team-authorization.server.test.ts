import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ForbiddenOperationError } from '../errors.server.ts';
import { UserTeamAuthorization } from './user-team-authorization.server.ts';

describe('UserEventAuthorization', () => {
  describe('#needsPermission', () => {
    it('returns the member info if allowed the given permission', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });

      const authorization = new UserTeamAuthorization(user.id, team.slug);
      const member = await authorization.needsPermission('canEditTeam');

      expect(member.memberId).toEqual(user.id);
      expect(member.teamId).toEqual(team.id);
      expect(member.permissions.canEditTeam).toBe(true);
      expect(member.role).toBe('OWNER');
    });

    it('throws an error if user role is not in the accepted role list', async () => {
      const user = await userFactory();
      const team = await teamFactory({ members: [user] });

      const authorization = new UserTeamAuthorization(user.id, team.slug);
      await expect(authorization.needsPermission('canEditTeam')).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user has access to another team but not the given one', async () => {
      const user = await userFactory();
      const team = await teamFactory();
      await teamFactory({ owners: [user] });

      const authorization = new UserTeamAuthorization(user.id, team.slug);
      await expect(authorization.needsPermission('canEditTeam')).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if team does not exist', async () => {
      const user = await userFactory();
      await teamFactory({ owners: [user] });

      const authorization = new UserTeamAuthorization(user.id, 'XXX');
      await expect(authorization.needsPermission('canEditTeam')).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
