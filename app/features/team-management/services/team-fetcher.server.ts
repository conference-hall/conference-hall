import { db } from 'prisma/db.server.ts';
import { TeamNotFoundError } from '~/shared/errors.server.ts';
import { TeamAuthorization } from '~/shared/user/team-authorization.server.ts';

export class TeamFetcher extends TeamAuthorization {
  static for(userId: string, team: string) {
    return new TeamFetcher(userId, team);
  }

  async get() {
    const { member, permissions } = await this.checkMemberPermissions('canAccessTeam');

    const team = await db.team.findUnique({ where: { slug: this.team } });
    if (!team) throw new TeamNotFoundError();

    return {
      id: team.id,
      name: team.name,
      slug: team.slug,
      userRole: member.role,
      invitationLink: permissions.canManageTeamMembers ? team.invitationLink : undefined,
    };
  }
}
