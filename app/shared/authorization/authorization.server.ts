import { db } from '../../../prisma/db.server.ts';
import { EventNotFoundError, ForbiddenOperationError } from '../errors.server.ts';
import { logger } from '../logger/logger.server.ts';
import { UserTeamPermissions } from './team-permissions.ts';
import type { AuthorizedEvent, AuthorizedTeam } from './types.ts';

export async function getAuthorizedTeam(userId: string, teamSlug: string): Promise<AuthorizedTeam> {
  try {
    const member = await db.teamMember.findFirst({ where: { memberId: userId, team: { slug: teamSlug } } });
    if (!member) {
      logger.warn('Authorization failed: User is not a member of team', { userId, teamSlug });
      throw new ForbiddenOperationError();
    }

    const permissions = UserTeamPermissions.getPermissions(member.role);
    if (!permissions.canAccessTeam) {
      logger.warn('Authorization failed: User role lacks canAccessTeam permission', {
        userId,
        teamSlug,
        teamId: member.teamId,
        role: member.role,
      });
      throw new ForbiddenOperationError();
    }

    return {
      userId,
      teamId: member.teamId,
      role: member.role,
      permissions,
    };
  } catch (error) {
    if (error instanceof ForbiddenOperationError) throw error;
    logger.error('Database error in getAuthorizedTeam:', { userId, teamSlug, error });
    throw error;
  }
}

export async function getAuthorizedEvent(authorizedTeam: AuthorizedTeam, eventSlug: string): Promise<AuthorizedEvent> {
  if (!authorizedTeam.permissions.canAccessEvent) {
    logger.warn('Authorization failed: User lacks canAccessEvent permission', {
      userId: authorizedTeam.userId,
      teamId: authorizedTeam.teamId,
      eventSlug,
      role: authorizedTeam.role,
    });
    throw new ForbiddenOperationError();
  }

  try {
    const event = await db.event.findUnique({ where: { slug: eventSlug, teamId: authorizedTeam.teamId } });

    if (!event) {
      logger.warn('Event not found or does not belong to team', {
        userId: authorizedTeam.userId,
        teamId: authorizedTeam.teamId,
        eventSlug,
      });
      throw new EventNotFoundError();
    }

    return { ...authorizedTeam, event };
  } catch (error) {
    if (error instanceof EventNotFoundError) throw error;
    logger.error('Database error in getAuthorizedEvent:', {
      userId: authorizedTeam.userId,
      teamId: authorizedTeam.teamId,
      eventSlug,
      error,
    });
    throw error;
  }
}
