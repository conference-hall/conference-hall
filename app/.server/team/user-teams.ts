import { db } from 'prisma/db.server.ts';
import { z } from 'zod';
import { ForbiddenOperationError } from '~/libs/errors.server.ts';
import { sortBy } from '~/libs/utils/arrays-sort-by.ts';
import { SlugSchema } from '~/libs/validators/slug.ts';
import { TeamBetaAccess } from './team-beta-access.ts';

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
      const events = team.events.map((event) => ({
        slug: event.slug,
        name: event.name,
        archived: event.archived,
        logoUrl: event.logoUrl,
      }));
      return { slug: team.slug, name: team.name, events: sortBy(events, 'name') };
    });

    return sortBy(teams, 'name');
  }

  async create(data: z.infer<typeof TeamCreateSchema>) {
    const user = await db.user.findFirst({ select: { organizerKey: true, teams: true }, where: { id: this.userId } });

    const hasBetaAccess = TeamBetaAccess.hasAccess(user, user?.teams?.length);
    if (!hasBetaAccess) throw new ForbiddenOperationError();

    return await db.$transaction(async (trx) => {
      const team = await trx.team.create({ data });
      await trx.teamMember.create({ data: { memberId: this.userId, teamId: team.id, role: 'OWNER' } });
      return team;
    });
  }

  static async isSlugValid(slug: string) {
    const count = await db.team.count({ where: { slug } });
    return count === 0;
  }
}

export const TeamCreateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  slug: SlugSchema.refine(UserTeams.isSlugValid, { message: 'This URL already exists.' }),
});
