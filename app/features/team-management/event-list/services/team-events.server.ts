import { db } from 'prisma/db.server.ts';
import { UserTeamAuthorization } from '~/shared/user/user-team-authorization.server.ts';

export class TeamEvents extends UserTeamAuthorization {
  static for(userId: string, team: string) {
    return new TeamEvents(userId, team);
  }

  async list(archived: boolean) {
    await this.needsPermission('canAccessEvent');

    const events = await db.event.findMany({
      where: { team: { slug: this.team }, archived },
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
