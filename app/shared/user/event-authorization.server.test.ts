import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ForbiddenOperationError } from '../errors.server.ts';
import { EventAuthorization } from './event-authorization.server.ts';

describe('EventAuthorization', () => {
  describe('#checkAuthorizedEvent', () => {
    it('returns event and permissions for team owner', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });
      const curEvent = await eventFactory({ team });

      const authorization = new EventAuthorization(user.id, team.slug, curEvent.slug);
      const { event, permissions } = await authorization.checkAuthorizedEvent();

      expect(event.id).toBe(curEvent.id);
      expect(permissions.canEditEvent).toBe(true);
      expect(permissions.canManageConversations).toBe(true);
    });

    it('returns event and permissions for team member', async () => {
      const user = await userFactory();
      const team = await teamFactory({ members: [user] });
      const curEvent = await eventFactory({ team });

      const authorization = new EventAuthorization(user.id, team.slug, curEvent.slug);
      const { event, permissions } = await authorization.checkAuthorizedEvent();

      expect(event.id).toBe(curEvent.id);
      expect(permissions.canEditEvent).toBe(true);
      expect(permissions.canAccessEvent).toBe(true);
      expect(permissions.canManageConversations).toBe(false);
    });

    it('returns the event if user is allowed for the given permission', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });
      const curEvent = await eventFactory({ team });

      const authorization = new EventAuthorization(user.id, team.slug, curEvent.slug);
      const { event } = await authorization.checkAuthorizedEvent('canEditEvent');

      expect(event.id).toEqual(curEvent.id);
    });

    it('throws an error if user role is not allowed for the permission', async () => {
      const user = await userFactory();
      const team = await teamFactory({ reviewers: [user] });
      const event = await eventFactory({ team });

      const authorization = new EventAuthorization(user.id, team.slug, event.slug);
      await expect(authorization.checkAuthorizedEvent('canEditEvent')).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if user role is not part of the team event', async () => {
      const user = await userFactory();
      const team = await teamFactory();
      const event = await eventFactory({ team });

      const authorization = new EventAuthorization(user.id, team.slug, event.slug);
      await expect(authorization.checkAuthorizedEvent('canEditEvent')).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if event is not part of the team', async () => {
      const user = await userFactory();
      const team = await teamFactory({ owners: [user] });
      const team2 = await teamFactory({ owners: [user] });
      const event = await eventFactory({ team: team2 });

      const authorization = new EventAuthorization(user.id, team.slug, event.slug);
      await expect(authorization.checkAuthorizedEvent('canEditEvent')).rejects.toThrowError(ForbiddenOperationError);
    });

    it('throws an error if event does not exist', async () => {
      const user = await userFactory();
      const team = await teamFactory();

      const authorization = new EventAuthorization(user.id, team.slug, 'XXX');
      await expect(authorization.checkAuthorizedEvent('canEditEvent')).rejects.toThrowError(ForbiddenOperationError);
    });
  });
});
