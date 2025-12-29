import { db } from 'prisma/db.server.ts';
import { EventNotFoundError, ForbiddenOperationError } from '../errors.server.ts';
import { UserTeamPermissions } from './team-permissions.ts';
import type { AuthorizedEvent, AuthorizedTeam } from './types.ts';

// todo(autho): add exhaustive tests
export async function getAuthorizedTeam(userId: string, teamSlug: string): Promise<AuthorizedTeam> {
  const member = await db.teamMember.findFirst({ where: { memberId: userId, team: { slug: teamSlug } } });
  if (!member) throw new ForbiddenOperationError();

  const permissions = UserTeamPermissions.getPermissions(member.role);

  return {
    userId,
    teamId: member.teamId,
    role: member.role,
    permissions,
  };
}

// todo(autho): add exhaustive tests
export async function getAuthorizedEvent(authorizedTeam: AuthorizedTeam, eventSlug: string): Promise<AuthorizedEvent> {
  const event = await db.event.findUnique({
    select: { id: true },
    where: { slug: eventSlug, teamId: authorizedTeam.teamId },
  });
  if (!event) throw new EventNotFoundError();

  return { ...authorizedTeam, eventId: event.id };
}
