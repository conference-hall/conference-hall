import { db } from 'prisma/db.server.ts';
import { z } from 'zod';
import { SlugSchema } from '~/libs/validators/slug.ts';
import { UserTeam } from './user-team.ts';

export class TeamEvents {
  constructor(private team: UserTeam) {}

  static for(userId: string, slug: string) {
    const team = UserTeam.for(userId, slug);
    return new TeamEvents(team);
  }

  async list(archived: boolean) {
    await this.team.needsPermission('canAccessEvent');

    const events = await db.event.findMany({
      where: { team: { slug: this.team.slug }, archived },
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

  async create(data: z.infer<typeof EventCreateSchema>) {
    await this.team.needsPermission('canCreateEvent');
    const { userId, slug } = this.team;
    return db.event.create({
      data: {
        ...data,
        creator: { connect: { id: userId } },
        team: { connect: { slug } },
      },
    });
  }

  static async isSlugValid(slug: string) {
    const count = await db.event.count({ where: { slug } });
    return count === 0;
  }
}

export const EventCreateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  type: z.enum(['CONFERENCE', 'MEETUP']),
  timezone: z.string(),
  slug: SlugSchema.refine(TeamEvents.isSlugValid, { message: 'This URL already exists.' }),
});
