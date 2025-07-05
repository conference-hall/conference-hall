import { db } from 'prisma/db.server.ts';
import { z } from 'zod';
import { ForbiddenOperationError, TeamNotFoundError } from '~/shared/errors.server.ts';
import { SlugSchema } from '~/shared/validators/slug.ts';
import type { Permission } from './user-permissions.ts';
import { UserPermissions } from './user-permissions.ts';

const TeamUpdateSchema = z.object({
  name: z.string().trim().min(3).max(50),
  slug: SlugSchema,
});

export class UserTeam {
  constructor(
    public userId: string,
    public slug: string,
  ) {}

  static for(userId: string, slug: string) {
    return new UserTeam(userId, slug);
  }

  async needsPermission(permission: Permission) {
    const roles = UserPermissions.getRoleWith(permission);

    const member = await db.teamMember.findFirst({
      where: { memberId: this.userId, role: { in: roles }, team: { slug: this.slug } },
    });
    if (!member) throw new ForbiddenOperationError();
    return {
      memberId: member.memberId,
      teamId: member.teamId,
      role: member.role,
      permissions: UserPermissions.getPermissions(member.role),
    };
  }

  async get() {
    const member = await this.needsPermission('canAccessTeam');

    const team = await db.team.findUnique({ where: { slug: this.slug } });
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
    return db.team.update({ where: { slug: this.slug }, data });
  }

  async buildUpdateSchema() {
    return TeamUpdateSchema.refine(
      async ({ slug }) => {
        const count = await db.team.count({ where: { AND: [{ slug }, { slug: { not: this.slug } }] } });
        return count === 0;
      },
      { message: 'This URL already exists.', path: ['slug'] },
    );
  }
}
