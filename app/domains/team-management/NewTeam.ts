import { z } from 'zod';

import { db } from '~/libs/db';
import { SlugAlreadyExistsError } from '~/libs/errors';
import { slugValidator } from '~/routes/__types/validators';

import { TeamBetaAccess } from './TeamBetaAccess';

export const TeamCreateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  slug: slugValidator,
});

export class NewTeam {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new NewTeam(userId);
  }

  async create(data: z.infer<typeof TeamCreateSchema>) {
    await TeamBetaAccess.for(this.userId).check();

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
