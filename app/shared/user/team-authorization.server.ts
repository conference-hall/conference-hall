import { db } from 'prisma/db.server.ts';
import { ForbiddenOperationError } from '../errors.server.ts';
import { type TeamPermission, UserTeamPermissions } from './team-permissions.ts';

export class TeamAuthorization {
  protected userId: string;
  protected team: string;

  constructor(userId: string, team: string) {
    this.userId = userId;
    this.team = team;
  }

  async checkMemberPermissions(forPermission?: TeamPermission) {
    const member = await db.teamMember.findFirst({ where: { memberId: this.userId, team: { slug: this.team } } });
    if (!member) throw new ForbiddenOperationError();

    const permissions = UserTeamPermissions.getPermissions(member.role);

    if (forPermission && !permissions[forPermission]) {
      throw new ForbiddenOperationError();
    }

    return { member, permissions };
  }
}
