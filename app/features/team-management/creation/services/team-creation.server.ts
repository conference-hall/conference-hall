import { z } from 'zod';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { SlugSchema } from '~/shared/validators/slug.ts';
import { db } from '../../../../../prisma/db.server.ts';

export class TeamCreation {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new TeamCreation(userId);
  }

  async create(data: z.infer<typeof TeamCreateSchema>, token?: string) {
    const user = await db.user.findFirst({ select: { teams: true }, where: { id: this.userId } });
    const hasTeams = (user?.teams?.length ?? 0) > 0;

    if (!hasTeams) {
      if (!token) throw new ForbiddenOperationError();
      await this.consumeToken(token);
    }

    const team = await db.team.create({ data });
    await db.teamMember.create({ data: { memberId: this.userId, teamId: team.id, role: 'OWNER' } });
    return team;
  }

  private async consumeToken(token: string) {
    const result = await db.teamAccessRequest.updateMany({
      where: { token, status: 'ACCEPTED' },
      data: { status: 'COMPLETED' },
    });

    if (result.count === 0) throw new ForbiddenOperationError();
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
