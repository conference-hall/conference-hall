import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { EventNotFoundError, ForbiddenOperationError } from '../errors.server.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from './authorization.server.ts';

describe('getAuthorizedTeam', () => {
  it('returns authorized team with correct permissions for OWNER role', async () => {
    const user = await userFactory();
    const team = await teamFactory({ owners: [user] });

    const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);

    expect(authorizedTeam.userId).toBe(user.id);
    expect(authorizedTeam.teamId).toBe(team.id);
    expect(authorizedTeam.role).toBe('OWNER');
    expect(authorizedTeam.permissions.canAccessTeam).toBe(true);
    expect(authorizedTeam.permissions.canEditTeam).toBe(true);
    expect(authorizedTeam.permissions.canDeleteTeam).toBe(true);
    expect(authorizedTeam.permissions.canManageTeamMembers).toBe(true);
    expect(authorizedTeam.permissions.canLeaveTeam).toBe(false);
  });

  it('returns authorized team with correct permissions for MEMBER role', async () => {
    const user = await userFactory();
    const team = await teamFactory({ members: [user] });

    const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);

    expect(authorizedTeam.userId).toBe(user.id);
    expect(authorizedTeam.teamId).toBe(team.id);
    expect(authorizedTeam.role).toBe('MEMBER');
    expect(authorizedTeam.permissions.canAccessTeam).toBe(true);
    expect(authorizedTeam.permissions.canEditTeam).toBe(false);
    expect(authorizedTeam.permissions.canDeleteTeam).toBe(false);
    expect(authorizedTeam.permissions.canManageTeamMembers).toBe(false);
    expect(authorizedTeam.permissions.canLeaveTeam).toBe(true);
  });

  it('returns authorized team with correct permissions for REVIEWER role', async () => {
    const user = await userFactory();
    const team = await teamFactory({ reviewers: [user] });

    const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);

    expect(authorizedTeam.userId).toBe(user.id);
    expect(authorizedTeam.teamId).toBe(team.id);
    expect(authorizedTeam.role).toBe('REVIEWER');
    expect(authorizedTeam.permissions.canAccessTeam).toBe(true);
    expect(authorizedTeam.permissions.canEditTeam).toBe(false);
    expect(authorizedTeam.permissions.canDeleteTeam).toBe(false);
    expect(authorizedTeam.permissions.canManageTeamMembers).toBe(false);
    expect(authorizedTeam.permissions.canLeaveTeam).toBe(true);
  });

  it('throws ForbiddenOperationError when user is not a team member', async () => {
    const user = await userFactory();
    const team = await teamFactory();

    await expect(getAuthorizedTeam(user.id, team.slug)).rejects.toThrow(ForbiddenOperationError);
  });

  it('throws ForbiddenOperationError when user belongs to different team but not the requested one', async () => {
    const user = await userFactory();
    const team = await teamFactory();
    await teamFactory({ owners: [user] });

    await expect(getAuthorizedTeam(user.id, team.slug)).rejects.toThrow(ForbiddenOperationError);
  });

  it('throws ForbiddenOperationError when team does not exist', async () => {
    const user = await userFactory();
    await teamFactory({ owners: [user] });

    await expect(getAuthorizedTeam(user.id, 'non-existent-team')).rejects.toThrow(ForbiddenOperationError);
  });
});

describe('getAuthorizedEvent', () => {
  it('returns authorized event with team context for OWNER', async () => {
    const user = await userFactory();
    const team = await teamFactory({ owners: [user] });
    const event = await eventFactory({ team });

    const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
    const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

    expect(authorizedEvent.userId).toBe(user.id);
    expect(authorizedEvent.teamId).toBe(team.id);
    expect(authorizedEvent.role).toBe('OWNER');
    expect(authorizedEvent.event.id).toBe(event.id);
    expect(authorizedEvent.event.slug).toBe(event.slug);
    expect(authorizedEvent.permissions.canAccessEvent).toBe(true);
    expect(authorizedEvent.permissions.canEditEvent).toBe(true);
  });

  it('returns authorized event with team context for MEMBER', async () => {
    const user = await userFactory();
    const team = await teamFactory({ members: [user] });
    const event = await eventFactory({ team });

    const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
    const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

    expect(authorizedEvent.userId).toBe(user.id);
    expect(authorizedEvent.teamId).toBe(team.id);
    expect(authorizedEvent.role).toBe('MEMBER');
    expect(authorizedEvent.event.id).toBe(event.id);
    expect(authorizedEvent.permissions.canAccessEvent).toBe(true);
    expect(authorizedEvent.permissions.canEditEvent).toBe(true);
  });

  it('returns authorized event with team context for REVIEWER', async () => {
    const user = await userFactory();
    const team = await teamFactory({ reviewers: [user] });
    const event = await eventFactory({ team });

    const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
    const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

    expect(authorizedEvent.userId).toBe(user.id);
    expect(authorizedEvent.teamId).toBe(team.id);
    expect(authorizedEvent.role).toBe('REVIEWER');
    expect(authorizedEvent.event.id).toBe(event.id);
    expect(authorizedEvent.permissions.canAccessEvent).toBe(true);
    expect(authorizedEvent.permissions.canEditEvent).toBe(false);
  });

  it('throws EventNotFoundError when event does not exist', async () => {
    const user = await userFactory();
    const team = await teamFactory({ owners: [user] });

    const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);

    await expect(getAuthorizedEvent(authorizedTeam, 'non-existent-event')).rejects.toThrow(EventNotFoundError);
  });

  it('throws EventNotFoundError when event belongs to different team (multi-tenancy isolation)', async () => {
    const user = await userFactory();
    const team1 = await teamFactory({ owners: [user] });
    const team2 = await teamFactory({ owners: [user] });
    const event = await eventFactory({ team: team2 });

    const authorizedTeam = await getAuthorizedTeam(user.id, team1.slug);

    await expect(getAuthorizedEvent(authorizedTeam, event.slug)).rejects.toThrow(EventNotFoundError);
  });
});
