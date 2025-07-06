import { db } from 'prisma/db.server.ts';
import { TeamNotFoundError } from '~/shared/errors.server.ts';
import { UserTeamAuthorization } from '~/shared/user/user-team-authorization.server.ts';

export class TeamFetcher extends UserTeamAuthorization {
  static for(userId: string, team: string) {
    return new TeamFetcher(userId, team);
  }

  async get() {
    const member = await this.needsPermission('canAccessTeam');

    const team = await db.team.findUnique({ where: { slug: this.team } });
    if (!team) throw new TeamNotFoundError();

    const userPermissions = member.permissions;

    return {
      id: team.id,
      name: team.name,
      slug: team.slug,
      userPermissions,
      userRole: member.role,
      invitationLink: userPermissions.canManageTeamMembers ? team.invitationLink : undefined,
    };
  }
}
