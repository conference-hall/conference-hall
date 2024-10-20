import { db } from 'prisma/db.server.ts';
import { z } from 'zod';

import { ForbiddenOperationError, SlugAlreadyExistsError } from '~/libs/errors.server.ts';
import { sortBy } from '~/libs/utils/arrays-sort-by.ts';
import { SlugSchema } from '~/libs/validators/slug.ts';

import { TeamBetaAccess } from './team-beta-access.ts';

export const TeamCreateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  slug: SlugSchema,
});

export class UserTeams {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new UserTeams(userId);
  }

  async list() {
    const teamsMembership = await db.teamMember.findMany({
      where: { memberId: this.userId },
      include: { team: { include: { events: true } } },
    });

    const teams = teamsMembership.map(({ team }) => {
      const events = team.events.map((event) => ({ slug: event.slug, name: event.name, logoUrl: event.logoUrl }));
      return { slug: team.slug, name: team.name, events: sortBy(events, 'name') };
    });

    return sortBy(teams, 'name');
  }

  async create(data: z.infer<typeof TeamCreateSchema>) {
    const user = await db.user.findFirst({ select: { organizerKey: true, teams: true }, where: { id: this.userId } });

    const hasBetaAccess = TeamBetaAccess.hasAccess(user, user?.teams?.length);
    if (!hasBetaAccess) throw new ForbiddenOperationError();

    return await db.$transaction(async (trx) => {
      const existSlug = await trx.team.findFirst({ where: { slug: data.slug } });
      if (existSlug) throw new SlugAlreadyExistsError();

      const team = await trx.team.create({ data });
      await trx.teamMember.create({
        data: { memberId: this.userId, teamId: team.id, role: 'OWNER' },
      });
      return team;
    });
  }
}
