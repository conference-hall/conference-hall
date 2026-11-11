import type { AuthorizedTeam } from '~/shared/authorization/types.ts';
import { resolveStorageUrl } from '~/shared/storage/storage-utils.ts';
import { db } from '../../../../../prisma/db.server.ts';
import type { TeamEventsStatus } from './team-events.schema.server.ts';

export class TeamEvents {
  constructor(private authorizedTeam: AuthorizedTeam) {}

  static for(authorizedTeam: AuthorizedTeam) {
    return new TeamEvents(authorizedTeam);
  }

  async list(status: TeamEventsStatus) {
    const { teamId } = this.authorizedTeam;

    const [events, groups] = await Promise.all([
      db.event.findMany({
        where: { teamId, archived: status === 'all' ? undefined : status === 'archived' },
        orderBy: [{ archived: 'asc' }, { createdAt: 'desc' }, { name: 'asc' }],
      }),
      db.event.groupBy({ by: ['archived'], where: { teamId }, _count: true }),
    ]);

    const active = groups.find((group) => !group.archived)?._count ?? 0;
    const archived = groups.find((group) => group.archived)?._count ?? 0;
    const counts = { active, archived, all: active + archived };

    return {
      events: events.map((event) => ({
        slug: event.slug,
        name: event.name,
        type: event.type,
        logoUrl: resolveStorageUrl(event.logo),
        timezone: event.timezone,
        cfpStart: event.cfpStart,
        cfpEnd: event.cfpEnd,
        cfpState: event.cfpState,
        archived: event.archived,
      })),
      counts,
    };
  }
}
