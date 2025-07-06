import { db } from 'prisma/db.server.ts';
import { ForbiddenOperationError } from '../errors.server.ts';
import { type Permission, UserPermissions } from './user-permissions.server.ts';

export class UserTeamAuthorization {
  constructor(
    protected userId: string,
    protected team: string,
  ) {}

  async needsPermission(permission: Permission) {
    const roles = UserPermissions.getRoleWith(permission);

    const member = await db.teamMember.findFirst({
      where: { memberId: this.userId, role: { in: roles }, team: { slug: this.team } },
    });

    if (!member) {
      throw new ForbiddenOperationError();
    }

    return {
      memberId: member.memberId,
      teamId: member.teamId,
      role: member.role,
      permissions: UserPermissions.getPermissions(member.role),
    };
  }
}
