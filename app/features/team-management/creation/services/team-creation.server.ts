import { db } from 'prisma/db.server.ts';
import { z } from 'zod';
import { TeamBetaAccess } from '~/features/team-management/creation/services/team-beta-access.server.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { SlugSchema } from '~/shared/validators/slug.ts';

export class TeamCreation {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new TeamCreation(userId);
  }

  async create(data: z.infer<typeof TeamCreateSchema>) {
    const user = await db.user.findFirst({ select: { organizerKey: true, teams: true }, where: { id: this.userId } });

    const hasBetaAccess = TeamBetaAccess.hasAccess(user, user?.teams?.length);
    if (!hasBetaAccess) throw new ForbiddenOperationError();

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
