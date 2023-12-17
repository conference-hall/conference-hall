import { z } from 'zod';

import { EventTypeSchema, EventVisibilitySchema } from '~/.server/shared/Event.types';
import { db } from 'prisma/db.server';
import { SlugAlreadyExistsError } from '~/libs/errors.server';
import { slugValidator } from '~/libs/validators/slug';

import { CallForPaper } from '../shared/CallForPaper';
import { UserTeam } from './UserTeam';

export const EventCreateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  visibility: EventVisibilitySchema,
  slug: slugValidator,
  type: EventTypeSchema,
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
      orderBy: { name: 'asc' },
    });

    return events.map((event) => ({
      slug: event.slug,
      name: event.name,
      type: event.type,
      logo: event.logo,
      cfpStart: event.cfpStart?.toUTCString(),
      cfpEnd: event.cfpEnd?.toUTCString(),
      cfpState: new CallForPaper(event).state,
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
