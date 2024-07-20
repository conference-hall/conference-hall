import { db } from 'prisma/db.server.ts';
import { z } from 'zod';

import { SlugAlreadyExistsError } from '~/libs/errors.server.ts';
import { SlugSchema } from '~/libs/validators/slug.ts';

import { UserTeam } from './user-team.ts';

export const EventCreateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  type: z.enum(['CONFERENCE', 'MEETUP']),
  timezone: z.string(),
  slug: SlugSchema,
});

export class TeamEvents {
  constructor(private team: UserTeam) {}

  static for(userId: string, slug: string) {
    const team = UserTeam.for(userId, slug);
    return new TeamEvents(team);
  }

  async list(archived: boolean) {
    await this.team.allowedFor(['MEMBER', 'REVIEWER', 'OWNER']);

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
      cfpStart: event.cfpStart?.toISOString(),
      cfpEnd: event.cfpEnd?.toISOString(),
      cfpState: event.cfpState,
    }));
  }

  async create(data: z.infer<typeof EventCreateSchema>) {
    await this.team.allowedFor(['OWNER']);

    const { userId, slug } = this.team;
    return await db.$transaction(async (trx) => {
      const existSlug = await trx.event.findFirst({ where: { slug: data.slug } });
      if (existSlug) throw new SlugAlreadyExistsError();

      return await trx.event.create({
        data: {
          ...data,
          creator: { connect: { id: userId } },
          team: { connect: { slug } },
        },
      });
    });
  }
}
