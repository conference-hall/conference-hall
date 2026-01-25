import { z } from 'zod';
import type { AuthorizedTeam } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { SlugSchema } from '~/shared/validators/slug.ts';
import { db } from '../../../../../prisma/db.server.ts';

const TeamUpdateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  slug: SlugSchema,
});

export class TeamSettings {
  constructor(private authorizedTeam: AuthorizedTeam) {}

  static for(authorizedTeam: AuthorizedTeam) {
    return new TeamSettings(authorizedTeam);
  }

  async delete() {
    const { teamId, permissions } = this.authorizedTeam;
    if (!permissions.canEditTeam) throw new ForbiddenOperationError();
    return db.team.delete({ where: { id: teamId } });
  }

  async updateSettings(data: z.infer<typeof TeamUpdateSchema>) {
    const { teamId, permissions } = this.authorizedTeam;
    if (!permissions.canEditTeam) throw new ForbiddenOperationError();
    return db.team.update({ where: { id: teamId }, data });
  }

  async isSlugValid(slug: string) {
    const { teamId } = this.authorizedTeam;
    const count = await db.team.count({ where: { AND: [{ slug }, { id: { not: teamId } }] } });
    return count === 0;
  }

  async buildUpdateSchema() {
    return TeamUpdateSchema.refine(async ({ slug }) => this.isSlugValid(slug), {
      path: ['slug'],
      error: 'This URL already exists.',
    });
  }
}
