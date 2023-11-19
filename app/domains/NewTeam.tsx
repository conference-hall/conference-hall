import { z } from 'zod';

import { db } from '~/libs/db';
import { ForbiddenOperationError, SlugAlreadyExistsError } from '~/libs/errors';
import { slugValidator } from '~/routes/__types/validators';

export const TeamCreateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  slug: slugValidator,
});

export class NewTeam {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new NewTeam(userId);
  }

  async allowed() {
    const user = await db.user.findFirst({ select: { organizerKey: true, teams: true }, where: { id: this.userId } });
    const hasOrganizations = Boolean(user?.teams?.length);
    if (!hasOrganizations && !user?.organizerKey) {
      throw new ForbiddenOperationError();
    }
  }

  async create(data: z.infer<typeof TeamCreateSchema>) {
    await this.allowed();

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
