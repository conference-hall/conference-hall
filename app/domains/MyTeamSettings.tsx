import { z } from 'zod';

import { db } from '~/libs/db';
import { SlugAlreadyExistsError } from '~/libs/errors';
import { slugValidator } from '~/routes/__types/validators';

import { MyTeam } from './MyTeam';

export const TeamUpdateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  slug: slugValidator,
});

export class MyTeamSettings {
  constructor(private team: MyTeam) {}

  static for(userId: string, slug: string) {
    const team = MyTeam.for(userId, slug);
    return new MyTeamSettings(team);
  }

  async update(data: z.infer<typeof TeamUpdateSchema>) {
    const member = await this.team.allowedFor(['OWNER']);

    return await db.$transaction(async (trx) => {
      const existSlug = await trx.team.findFirst({ where: { slug: data.slug, id: { not: member.teamId } } });
      if (existSlug) throw new SlugAlreadyExistsError();

      return trx.team.update({ where: { slug: this.team.slug }, data });
    });
  }
}
