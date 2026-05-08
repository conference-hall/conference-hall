import { z } from 'zod';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { SlugSchema } from '~/shared/validators/slug.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { hasTeamAccess } from './has-team-access.server.ts';

export class TeamCreation {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new TeamCreation(userId);
  }

  async create(data: z.infer<typeof TeamCreateSchema>) {
    const hasAccess = await hasTeamAccess(this.userId);
    if (!hasAccess) throw new ForbiddenOperationError();

    const team = await db.team.create({ data });
    await db.teamMember.create({ data: { memberId: this.userId, teamId: team.id, role: 'OWNER' } });
    return team;
  }

  static async isSlugValid(slug: string) {
    const count = await db.team.count({ where: { slug } });
    return count === 0;
  }
}

export const TeamCreateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  slug: SlugSchema.refine(TeamCreation.isSlugValid, { error: 'This URL already exists.' }),
});
