import { InvitationInvalidOrAccepted, InvitationNotFoundError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';

export class TeamMemberInvite {
  constructor(private code: string) {}

  static with(code: string) {
    return new TeamMemberInvite(code);
  }

  async check() {
    const team = await db.team.findUnique({ where: { invitationCode: this.code } });
    if (!team) throw new InvitationNotFoundError();

    return team;
  }

  async addMember(userId: string) {
    const team = await this.check();

    const exists = await db.teamMember.count({ where: { memberId: userId, teamId: team.id } });
    if (exists > 0) throw new InvitationInvalidOrAccepted();

    await db.teamMember.create({ data: { memberId: userId, teamId: team.id } });

    return team;
  }
}
