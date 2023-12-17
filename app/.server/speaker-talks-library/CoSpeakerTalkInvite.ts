import { db } from '~/libs/db.server';
import { InvitationInvalidOrAccepted, InvitationNotFoundError } from '~/libs/errors.server';

export class CoSpeakerTalkInvite {
  constructor(private code: string) {}

  static with(code: string) {
    return new CoSpeakerTalkInvite(code);
  }

  async check() {
    const talk = await db.talk.findUnique({ where: { invitationCode: this.code } });

    if (!talk) throw new InvitationNotFoundError();

    return talk;
  }

  async addCoSpeaker(coSpeakerId: string) {
    const talk = await this.check();

    try {
      await db.talk.update({
        where: { id: talk.id },
        data: { speakers: { connect: { id: coSpeakerId } } },
      });
    } catch (e) {
      throw new InvitationInvalidOrAccepted();
    }

    return talk;
  }
}
