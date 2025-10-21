import { db } from 'prisma/db.server.ts';
import { z } from 'zod';
import { TeamAuthorization } from '~/shared/user/team-authorization.server.ts';
import { SlugSchema } from '~/shared/validators/slug.ts';

const TeamUpdateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  slug: SlugSchema,
});

export class TeamSettings extends TeamAuthorization {
  static for(userId: string, team: string) {
    return new TeamSettings(userId, team);
  }

  async delete() {
    const { member } = await this.checkMemberPermissions('canEditTeam');
    return db.team.delete({ where: { id: member.teamId } });
  }

  async updateSettings(data: z.infer<typeof TeamUpdateSchema>) {
    await this.checkMemberPermissions('canEditTeam');
    return db.team.update({ where: { slug: this.team }, data });
  }

  async isSlugValid(slug: string) {
    const count = await db.team.count({ where: { AND: [{ slug }, { slug: { not: this.team } }] } });
    return count === 0;
  }

  async buildUpdateSchema() {
    return TeamUpdateSchema.refine(async ({ slug }) => this.isSlugValid(slug), {
      path: ['slug'],
      error: 'This URL already exists.',
    });
  }
}
