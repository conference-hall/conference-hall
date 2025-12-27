import { db } from 'prisma/db.server.ts';
import { ForbiddenOperationError } from '../errors.server.ts';
import { UserTeamPermissions } from './team-permissions.ts';

export async function checkTeamAuthorizations(userId: string, teamSlug: string) {
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

export async function checkEventAuthorizations(userId: string, teamSlug: string, eventSlug: string) {
  const teamAuthContext = await checkTeamAuthorizations(userId, teamSlug);

  const event = await db.event.findUnique({ where: { slug: eventSlug, teamId: teamAuthContext.teamId } });
  if (!event) throw new ForbiddenOperationError();

  return {
    ...teamAuthContext,
    eventId: event.id,
  };
}
