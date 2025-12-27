import { db } from 'prisma/db.server.ts';
import { ForbiddenOperationError } from '../errors.server.ts';
import { UserTeamPermissions } from './team-permissions.ts';

// todo(autho): add exhaustive tests
export async function getAuthorizedTeam(userId: string, teamSlug: string) {
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
export async function getAuthorizedEvent(userId: string, teamSlug: string, eventSlug: string) {
  const teamAuthContext = await getAuthorizedTeam(userId, teamSlug);

  const event = await db.event.findUnique({ where: { slug: eventSlug, teamId: teamAuthContext.teamId } });
  if (!event) throw new ForbiddenOperationError();

  return {
    ...teamAuthContext,
    eventId: event.id,
  };
}
