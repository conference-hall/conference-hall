import type { AuthorizedTeam } from '~/shared/authorization/types.ts';
import { resolveStorageUrl } from '~/shared/storage/storage-key.server.ts';
import { db } from '../../../../../prisma/db.server.ts';

export class TeamEvents {
  constructor(private authorizedTeam: AuthorizedTeam) {}

  static for(authorizedTeam: AuthorizedTeam) {
    return new TeamEvents(authorizedTeam);
  }

  async list(archived: boolean) {
    const { teamId } = this.authorizedTeam;

    const events = await db.event.findMany({
      where: { teamId, archived },
      orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
    });

    return events.map((event) => ({
      slug: event.slug,
      name: event.name,
      type: event.type,
      logoUrl: resolveStorageUrl(event.logo),
      timezone: event.timezone,
      cfpStart: event.cfpStart,
      cfpEnd: event.cfpEnd,
      cfpState: event.cfpState,
    }));
  }
}
