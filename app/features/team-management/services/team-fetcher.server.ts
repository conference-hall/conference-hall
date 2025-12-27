import { db } from 'prisma/db.server.ts';
import type { AuthorizedTeam } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError, TeamNotFoundError } from '~/shared/errors.server.ts';

export class TeamFetcher {
  constructor(private authorizedTeam: AuthorizedTeam) {}

  static for(authorizedTeam: AuthorizedTeam) {
    return new TeamFetcher(authorizedTeam);
  }

  async get() {
    const { teamId, role, permissions } = this.authorizedTeam;
    if (!permissions.canAccessTeam) throw new ForbiddenOperationError();

    const team = await db.team.findUnique({ where: { id: teamId } });
    if (!team) throw new TeamNotFoundError();

    return {
      id: team.id,
      name: team.name,
      slug: team.slug,
      userRole: role,
      invitationLink: permissions.canManageTeamMembers ? team.invitationLink : undefined,
    };
  }
}
