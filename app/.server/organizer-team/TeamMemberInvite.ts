import { db } from '~/libs/db.server';
import { InvitationInvalidOrAccepted, InvitationNotFoundError } from '~/libs/errors.server';

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

    try {
      await db.teamMember.create({ data: { memberId: userId, teamId: team.id } });
    } catch (e) {
      throw new InvitationInvalidOrAccepted();
    }

    return team;
  }
}
