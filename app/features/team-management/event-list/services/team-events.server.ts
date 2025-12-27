import { db } from 'prisma/db.server.ts';
import type { AuthorizedTeam } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';

export class TeamEvents {
  constructor(private authorizedTeam: AuthorizedTeam) {}

  static for(authorizedTeam: AuthorizedTeam) {
    return new TeamEvents(authorizedTeam);
  }

  async list(archived: boolean) {
    const { teamId, permissions } = this.authorizedTeam;
    if (!permissions.canAccessTeam) throw new ForbiddenOperationError();

    const events = await db.event.findMany({
      where: { teamId, archived },
      orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
    });

    return events.map((event) => ({
      slug: event.slug,
      name: event.name,
      type: event.type,
      logoUrl: event.logoUrl,
      timezone: event.timezone,
      cfpStart: event.cfpStart,
      cfpEnd: event.cfpEnd,
      cfpState: event.cfpState,
    }));
  }
}
