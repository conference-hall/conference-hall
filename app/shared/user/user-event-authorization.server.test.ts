import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ForbiddenOperationError } from '../errors.server.ts';
import { UserEventAuthorization } from './user-event-authorization.server.ts';

describe('UserEventAuthorization', () => {
  describe('#needsPermission', () => {
    it('returns the event if user is allowed for the given permission', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });
      const event = await eventFactory({ team });

      const authorization = new UserEventAuthorization(user.id, team.slug, event.slug);
      const result = await authorization.needsPermission('canEditEvent');
      expect(result.id).toEqual(event.id);
    });

    it('throws an error if user role is not allowed for the permission', async () => {
      const user = await userFactory();
      const team = await teamFactory({ reviewers: [user] });
      const event = await eventFactory({ team });

      const authorization = new UserEventAuthorization(user.id, team.slug, event.slug);
      await expect(authorization.needsPermission('canEditEvent')).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user role is not part of the team event', async () => {
      const user = await userFactory();
      const team = await teamFactory();
      const event = await eventFactory({ team });

      const authorization = new UserEventAuthorization(user.id, team.slug, event.slug);
      await expect(authorization.needsPermission('canEditEvent')).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if event is not part of the team', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });
      const team2 = await teamFactory({ owners: [user] });
      const event = await eventFactory({ team: team2 });

      const authorization = new UserEventAuthorization(user.id, team.slug, event.slug);
      await expect(authorization.needsPermission('canEditEvent')).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if event does not exist', async () => {
      const user = await userFactory();
      const team = await teamFactory();

      const authorization = new UserEventAuthorization(user.id, team.slug, 'XXX');
      await expect(authorization.needsPermission('canEditEvent')).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('#getPermissions', () => {
    it('returns permissions for team owner', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });
      const event = await eventFactory({ team });

      const authorization = new UserEventAuthorization(user.id, team.slug, event.slug);
      const permissions = await authorization.getPermissions();

      expect(permissions.canEditEvent).toBe(true);
      expect(permissions.canManageConversations).toBe(true);
    });

    it('returns permissions for team member', async () => {
      const user = await userFactory();
      const team = await teamFactory({ members: [user] });
      const event = await eventFactory({ team });

      const authorization = new UserEventAuthorization(user.id, team.slug, event.slug);
      const permissions = await authorization.getPermissions();

      expect(permissions.canEditEvent).toBe(true);
      expect(permissions.canAccessEvent).toBe(true);
      expect(permissions.canManageConversations).toBe(false);
    });

    it('throws an error if user does not belong to team', async () => {
      const user = await userFactory();
      const team = await teamFactory();
      const event = await eventFactory({ team });

      const authorization = new UserEventAuthorization(user.id, team.slug, event.slug);
      await expect(authorization.getPermissions()).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
