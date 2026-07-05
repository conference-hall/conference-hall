import { db } from '../../../prisma/db.server.ts';
import { EventNotFoundError, ForbiddenOperationError } from '../errors.server.ts';
import { logger } from '../logger/logger.server.ts';
import { UserTeamPermissions } from './team-permissions.ts';
import type { AuthorizedEvent, AuthorizedTeam } from './types.ts';

export async function getAuthorizedTeam(userId: string, teamSlug: string): Promise<AuthorizedTeam> {
  try {
    const member = await db.teamMember.findFirst({ where: { memberId: userId, team: { slug: teamSlug } } });
    if (!member) {
      logger.warn({ userId, teamSlug }, 'Authorization failed: User is not a member of team');
      throw new ForbiddenOperationError();
    }

    const permissions = UserTeamPermissions.getPermissions(member.role);
    if (!permissions.canAccessTeam) {
      logger.warn(
        {
          userId,
          teamSlug,
          teamId: member.teamId,
          role: member.role,
        },
        'Authorization failed: User role lacks canAccessTeam permission',
      );
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
    logger.error({ userId, teamSlug, error }, 'Database error in getAuthorizedTeam:');
    throw error;
  }
}

export async function getAuthorizedEvent(authorizedTeam: AuthorizedTeam, eventSlug: string): Promise<AuthorizedEvent> {
  if (!authorizedTeam.permissions.canAccessEvent) {
    logger.warn(
      {
        userId: authorizedTeam.userId,
        teamId: authorizedTeam.teamId,
        eventSlug,
        role: authorizedTeam.role,
      },
      'Authorization failed: User lacks canAccessEvent permission',
    );
    throw new ForbiddenOperationError();
  }

  try {
    const event = await db.event.findUnique({ where: { slug: eventSlug, teamId: authorizedTeam.teamId } });

    if (!event) {
      logger.warn(
        {
          userId: authorizedTeam.userId,
          teamId: authorizedTeam.teamId,
          eventSlug,
        },
        'Event not found or does not belong to team',
      );
      throw new EventNotFoundError();
    }

    return { ...authorizedTeam, event };
  } catch (error) {
    if (error instanceof EventNotFoundError) throw error;
    logger.error(
      {
        userId: authorizedTeam.userId,
        teamId: authorizedTeam.teamId,
        eventSlug,
        error,
      },
      'Database error in getAuthorizedEvent:',
    );
    throw error;
  }
}
