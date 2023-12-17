import { z } from 'zod';

import { db } from 'prisma/db.server';
import { ForbiddenOperationError, SlugAlreadyExistsError } from '~/libs/errors.server';
import { sortBy } from '~/libs/utils/arrays-sort-by';
import { slugValidator } from '~/libs/validators/slug';

import { TeamBetaAccess } from './TeamBetaAccess';

export const TeamCreateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  slug: slugValidator,
});

export class UserTeams {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new UserTeams(userId);
  }

  async list() {
    const accesses = await db.teamMember.findMany({ where: { memberId: this.userId }, include: { team: true } });
    return sortBy(
      accesses.map((member) => ({ slug: member.team.slug, name: member.team.name, role: member.role })),
      'name',
    );
  }

  async create(data: z.infer<typeof TeamCreateSchema>) {
    const isAllowed = await TeamBetaAccess.for(this.userId).isAllowed();
    if (!isAllowed) throw new ForbiddenOperationError();

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
