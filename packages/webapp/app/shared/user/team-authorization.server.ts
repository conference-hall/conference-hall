import { db } from '@conference-hall/database';
import { ForbiddenOperationError } from '../errors.server.ts';
import { type Permission, UserPermissions } from './user-permissions.server.ts';

export class TeamAuthorization {
  protected userId: string;
  protected team: string;

  constructor(userId: string, team: string) {
    this.userId = userId;
    this.team = team;
  }

  async checkMemberPermissions(forPermission?: Permission) {
    const member = await db.teamMember.findFirst({ where: { memberId: this.userId, team: { slug: this.team } } });
    if (!member) throw new ForbiddenOperationError();

    const permissions = UserPermissions.getPermissions(member.role);

    if (forPermission && !permissions[forPermission]) {
      throw new ForbiddenOperationError();
    }

    return { member, permissions };
  }
}
