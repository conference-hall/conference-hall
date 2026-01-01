import type { createContext } from 'react-router';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import type { Mock } from 'vitest';
import { RequireAuthContext } from '../authentication/auth.middleware.ts';
import { BadRequestError, EventNotFoundError, ForbiddenOperationError, NotFoundError } from '../errors.server.ts';
import {
  AuthorizedEventContext,
  AuthorizedTeamContext,
  requireAdmin,
  requireAuthorizedEvent,
  requireAuthorizedTeam,
} from './authorization.middleware.ts';
import * as authorizationServer from './authorization.server.ts';

vi.mock('./authorization.server.ts', async () => {
  const actual = await vi.importActual<typeof authorizationServer>('./authorization.server.ts');
  return {
    ...actual,
    getAuthorizedTeam: vi.fn(),
    getAuthorizedEvent: vi.fn(),
  };
});

const getAuthorizedTeamMock = authorizationServer.getAuthorizedTeam as Mock;
const getAuthorizedEventMock = authorizationServer.getAuthorizedEvent as Mock;

function createMockContext() {
  const store = new Map();
  return {
    get: (key: ReturnType<typeof createContext>) => store.get(key),
    set: (key: ReturnType<typeof createContext>, value: unknown) => store.set(key, value),
  };
}

function createMockRequest(url = 'https://example.com/test') {
  return new Request(url);
}

const mockNext = vi.fn(async () => new Response());

describe('requireAdmin', () => {
  it('allows access when user is admin', async () => {
    const user = await userFactory({ traits: ['admin'] });
    const request = createMockRequest();
    const context = createMockContext();

    context.set(RequireAuthContext, {
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      picture: user.picture,
      teams: [],
      hasTeamAccess: false,
      notificationsUnreadCount: 0,
    });

    await requireAdmin({ request, context, params: {}, unstable_pattern: '' }, mockNext);
  });

  it('throws BadRequestError when requireAuthUser middleware was not run first', async () => {
    const request = createMockRequest();
    const context = createMockContext();

    context.set(RequireAuthContext, null);

    try {
      await requireAdmin({ request, context, params: {}, unstable_pattern: '' }, mockNext);
      expect.fail('Should have thrown BadRequestError');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect((error as Response).status).toBe(400);
      expect((error as Response).statusText).toBe('`requireAdmin` must be defined after `requireAuthUser`');
    }
  });

  it('throws NotFoundError when user is not admin', async () => {
    const user = await userFactory();
    const request = createMockRequest();
    const context = createMockContext();

    context.set(RequireAuthContext, {
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      picture: user.picture,
      teams: [],
      hasTeamAccess: false,
      notificationsUnreadCount: 0,
    });

    await expect(async () => {
      await requireAdmin({ request, context, params: {}, unstable_pattern: '' }, mockNext);
    }).rejects.toThrow(NotFoundError);
  });
});

describe('requireAuthorizedTeam', () => {
  it('sets authorized team in context when user is authenticated and is team member', async () => {
    const user = await userFactory();
    const team = await teamFactory({ owners: [user] });
    const request = createMockRequest();
    const context = createMockContext();

    context.set(RequireAuthContext, {
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      picture: user.picture,
      teams: [],
      hasTeamAccess: false,
      notificationsUnreadCount: 0,
    });

    const authorizedTeam = {
      userId: user.id,
      teamId: team.id,
      role: 'OWNER' as const,
      permissions: {
        canAccessTeam: true,
        canEditTeam: true,
        canDeleteTeam: true,
        canManageTeamMembers: true,
        canLeaveTeam: false,
        canAccessEvent: true,
        canCreateEvent: true,
        canEditEvent: true,
        canDeleteEvent: true,
        canCreateEventProposal: true,
        canCreateEventSpeaker: true,
        canEditEventSpeaker: true,
        canEditEventProposal: true,
        canManageConversations: true,
        canExportEventProposals: true,
        canChangeProposalStatus: true,
        canPublishEventResults: true,
        canEditEventSchedule: true,
      },
    };

    getAuthorizedTeamMock.mockResolvedValue(authorizedTeam);

    await requireAuthorizedTeam({ request, context, params: { team: team.slug }, unstable_pattern: '' }, mockNext);

    expect(getAuthorizedTeamMock).toHaveBeenCalledWith(user.id, team.slug);
    expect(context.get(AuthorizedTeamContext)).toEqual(authorizedTeam);
  });

  it('throws BadRequestError when requireAuthUser middleware was not run first', async () => {
    const request = createMockRequest();
    const context = createMockContext();

    context.set(RequireAuthContext, null);

    try {
      await requireAuthorizedTeam({ request, context, params: { team: 'test-team' }, unstable_pattern: '' }, mockNext);
      expect.fail('Should have thrown BadRequestError');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect((error as Response).status).toBe(400);
      expect((error as Response).statusText).toBe('`requireAuthorizedTeam` must be defined after `requireAuthUser`');
    }
  });

  it('throws BadRequestError when route params lack team parameter', async () => {
    const user = await userFactory();
    const request = createMockRequest();
    const context = createMockContext();

    context.set(RequireAuthContext, {
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      picture: user.picture,
      teams: [],
      hasTeamAccess: false,
      notificationsUnreadCount: 0,
    });

    try {
      await requireAuthorizedTeam({ request, context, params: {}, unstable_pattern: '' }, mockNext);
      expect.fail('Should have thrown BadRequestError');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect((error as Response).status).toBe(400);
      expect((error as Response).statusText).toBe('Team authorization must be defined on a `/team/:team` route.');
    }
  });

  it('throws ForbiddenOperationError when getAuthorizedTeam rejects (unauthorized user)', async () => {
    const user = await userFactory();
    const request = createMockRequest();
    const context = createMockContext();

    context.set(RequireAuthContext, {
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      picture: user.picture,
      teams: [],
      hasTeamAccess: false,
      notificationsUnreadCount: 0,
    });
    getAuthorizedTeamMock.mockRejectedValue(new ForbiddenOperationError());

    await expect(async () => {
      await requireAuthorizedTeam(
        { request, context, params: { team: 'unauthorized-team' }, unstable_pattern: '' },
        mockNext,
      );
    }).rejects.toThrow(ForbiddenOperationError);
  });
});

describe('requireAuthorizedEvent', () => {
  it('sets authorized event in context when team is authorized and event exists', async () => {
    const user = await userFactory();
    const team = await teamFactory({ owners: [user] });
    const event = await eventFactory({ team });
    const request = createMockRequest();
    const context = createMockContext();

    const authorizedTeam = {
      userId: user.id,
      teamId: team.id,
      role: 'OWNER' as const,
      permissions: {
        canAccessTeam: true,
        canEditTeam: true,
        canDeleteTeam: true,
        canManageTeamMembers: true,
        canLeaveTeam: false,
        canAccessEvent: true,
        canCreateEvent: true,
        canEditEvent: true,
        canDeleteEvent: true,
        canCreateEventProposal: true,
        canCreateEventSpeaker: true,
        canEditEventSpeaker: true,
        canEditEventProposal: true,
        canManageConversations: true,
        canExportEventProposals: true,
        canChangeProposalStatus: true,
        canPublishEventResults: true,
        canEditEventSchedule: true,
      },
    };

    const authorizedEvent = { ...authorizedTeam, event };

    context.set(AuthorizedTeamContext, authorizedTeam);
    getAuthorizedEventMock.mockResolvedValue(authorizedEvent);

    await requireAuthorizedEvent({ request, context, params: { event: event.slug }, unstable_pattern: '' }, mockNext);

    expect(getAuthorizedEventMock).toHaveBeenCalledWith(authorizedTeam, event.slug);
    expect(context.get(AuthorizedEventContext)).toEqual(authorizedEvent);
  });

  it('throws BadRequestError when requireAuthorizedTeam middleware was not run first', async () => {
    const request = createMockRequest();
    const context = createMockContext();

    try {
      await requireAuthorizedEvent(
        { request, context, params: { event: 'test-event' }, unstable_pattern: '' },
        mockNext,
      );
      expect.fail('Should have thrown BadRequestError');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect((error as Response).status).toBe(400);
      expect((error as Response).statusText).toBe(
        '`requireAuthorizedEvent` must be defined after `requireAuthorizedTeam`',
      );
    }
  });

  it('throws BadRequestError when route params lack event parameter', async () => {
    const user = await userFactory();
    const team = await teamFactory({ owners: [user] });
    const request = createMockRequest();
    const context = createMockContext();

    const authorizedTeam = {
      userId: user.id,
      teamId: team.id,
      role: 'OWNER' as const,
      permissions: {
        canAccessTeam: true,
        canEditTeam: true,
        canDeleteTeam: true,
        canManageTeamMembers: true,
        canLeaveTeam: false,
        canAccessEvent: true,
        canCreateEvent: true,
        canEditEvent: true,
        canDeleteEvent: true,
        canCreateEventProposal: true,
        canCreateEventSpeaker: true,
        canEditEventSpeaker: true,
        canEditEventProposal: true,
        canManageConversations: true,
        canExportEventProposals: true,
        canChangeProposalStatus: true,
        canPublishEventResults: true,
        canEditEventSchedule: true,
      },
    };

    context.set(AuthorizedTeamContext, authorizedTeam);

    try {
      await requireAuthorizedEvent({ request, context, params: {}, unstable_pattern: '' }, mockNext);
      expect.fail('Should have thrown BadRequestError');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect((error as Response).status).toBe(400);
      expect((error as Response).statusText).toBe(
        'Event authorization must be defined on a `/team/:team/:event` route.',
      );
    }
  });

  it('throws ForbiddenOperationError when user lacks event access permission', async () => {
    const user = await userFactory();
    const team = await teamFactory({ owners: [user] });
    const request = createMockRequest();
    const context = createMockContext();

    const authorizedTeam = {
      userId: user.id,
      teamId: team.id,
      role: 'OWNER' as const,
      permissions: {
        canAccessTeam: true,
        canEditTeam: true,
        canDeleteTeam: true,
        canManageTeamMembers: true,
        canLeaveTeam: false,
        canAccessEvent: true,
        canCreateEvent: true,
        canEditEvent: true,
        canDeleteEvent: true,
        canCreateEventProposal: true,
        canCreateEventSpeaker: true,
        canEditEventSpeaker: true,
        canEditEventProposal: true,
        canManageConversations: true,
        canExportEventProposals: true,
        canChangeProposalStatus: true,
        canPublishEventResults: true,
        canEditEventSchedule: true,
      },
    };

    context.set(AuthorizedTeamContext, authorizedTeam);
    getAuthorizedEventMock.mockRejectedValue(new ForbiddenOperationError());

    await expect(async () => {
      await requireAuthorizedEvent(
        { request, context, params: { event: 'unauthorized-event' }, unstable_pattern: '' },
        mockNext,
      );
    }).rejects.toThrow(ForbiddenOperationError);
  });

  it('throws EventNotFoundError when event does not exist', async () => {
    const user = await userFactory();
    const team = await teamFactory({ owners: [user] });
    const request = createMockRequest();
    const context = createMockContext();

    const authorizedTeam = {
      userId: user.id,
      teamId: team.id,
      role: 'OWNER' as const,
      permissions: {
        canAccessTeam: true,
        canEditTeam: true,
        canDeleteTeam: true,
        canManageTeamMembers: true,
        canLeaveTeam: false,
        canAccessEvent: true,
        canCreateEvent: true,
        canEditEvent: true,
        canDeleteEvent: true,
        canCreateEventProposal: true,
        canCreateEventSpeaker: true,
        canEditEventSpeaker: true,
        canEditEventProposal: true,
        canManageConversations: true,
        canExportEventProposals: true,
        canChangeProposalStatus: true,
        canPublishEventResults: true,
        canEditEventSchedule: true,
      },
    };

    context.set(AuthorizedTeamContext, authorizedTeam);
    getAuthorizedEventMock.mockRejectedValue(new EventNotFoundError());

    await expect(async () => {
      await requireAuthorizedEvent(
        { request, context, params: { event: 'non-existent-event' }, unstable_pattern: '' },
        mockNext,
      );
    }).rejects.toThrow(EventNotFoundError);
  });
});

describe('middleware chain behavior', () => {
  it('correctly chains team and event authorization', async () => {
    const user = await userFactory();
    const team = await teamFactory({ owners: [user] });
    const event = await eventFactory({ team });
    const request = createMockRequest();
    const context = createMockContext();

    const authorizedTeam = {
      userId: user.id,
      teamId: team.id,
      role: 'OWNER' as const,
      permissions: {
        canAccessTeam: true,
        canEditTeam: true,
        canDeleteTeam: true,
        canManageTeamMembers: true,
        canLeaveTeam: false,
        canAccessEvent: true,
        canCreateEvent: true,
        canEditEvent: true,
        canDeleteEvent: true,
        canCreateEventProposal: true,
        canCreateEventSpeaker: true,
        canEditEventSpeaker: true,
        canEditEventProposal: true,
        canManageConversations: true,
        canExportEventProposals: true,
        canChangeProposalStatus: true,
        canPublishEventResults: true,
        canEditEventSchedule: true,
      },
    };

    context.set(RequireAuthContext, {
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      picture: user.picture,
      teams: [],
      hasTeamAccess: false,
      notificationsUnreadCount: 0,
    });

    const authorizedEvent = { ...authorizedTeam, event };
    getAuthorizedTeamMock.mockResolvedValue(authorizedTeam);
    getAuthorizedEventMock.mockResolvedValue(authorizedEvent);

    await requireAuthorizedTeam({ request, context, params: { team: team.slug }, unstable_pattern: '' }, mockNext);
    await requireAuthorizedEvent({ request, context, params: { event: event.slug }, unstable_pattern: '' }, mockNext);

    expect(context.get(AuthorizedTeamContext)).toEqual(authorizedTeam);
    expect(context.get(AuthorizedEventContext)).toEqual(authorizedEvent);
  });

  it('requireAuthorizedEvent fails when requireAuthorizedTeam has not run', async () => {
    const request = createMockRequest();
    const context = createMockContext();

    await expect(async () => {
      await requireAuthorizedEvent(
        { request, context, params: { event: 'test-event' }, unstable_pattern: '' },
        mockNext,
      );
    }).rejects.toThrow(BadRequestError);
  });
});
