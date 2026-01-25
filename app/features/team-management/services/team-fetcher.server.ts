import type { AuthorizedTeam } from '~/shared/authorization/types.ts';
import { TeamNotFoundError } from '~/shared/errors.server.ts';
import { db } from '../../../../prisma/db.server.ts';

export class TeamFetcher {
  constructor(private authorizedTeam: AuthorizedTeam) {}

  static for(authorizedTeam: AuthorizedTeam) {
    return new TeamFetcher(authorizedTeam);
  }

  async get() {
    const { teamId, role, permissions } = this.authorizedTeam;

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
