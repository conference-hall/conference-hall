import { db } from 'prisma/db.server.ts';
import { z } from 'zod';
import { TeamNotFoundError } from '~/shared/errors.server.ts';
import { UserTeamAuthorization } from '~/shared/user/user-team-authorization.server.ts';
import { SlugSchema } from '~/shared/validators/slug.ts';

const TeamUpdateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  slug: SlugSchema,
});

export class TeamSettings extends UserTeamAuthorization {
  static for(userId: string, team: string) {
    return new TeamSettings(userId, team);
  }

  // todo(folders): where to put this file?
  async get() {
    const member = await this.needsPermission('canAccessTeam');

    const team = await db.team.findUnique({ where: { slug: this.team } });
    if (!team) throw new TeamNotFoundError();

    const userPermissions = member.permissions;

    return {
      id: team.id,
      name: team.name,
      slug: team.slug,
      userPermissions,
      userRole: member.role,
      invitationLink: userPermissions.canManageTeamMembers ? team.invitationLink : undefined,
    };
  }

  async delete() {
    const { teamId } = await this.needsPermission('canEditTeam');
    return db.team.delete({ where: { id: teamId } });
  }

  async updateSettings(data: z.infer<typeof TeamUpdateSchema>) {
    await this.needsPermission('canEditTeam');
    return db.team.update({ where: { slug: this.team }, data });
  }

  async buildUpdateSchema() {
    return TeamUpdateSchema.refine(
      async ({ slug }) => {
        const count = await db.team.count({ where: { AND: [{ slug }, { slug: { not: this.team } }] } });
        return count === 0;
      },
      { message: 'This URL already exists.', path: ['slug'] },
    );
  }
}
