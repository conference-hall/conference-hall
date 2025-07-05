import { db } from 'prisma/db.server.ts';

import { InvitationInvalidOrAccepted, InvitationNotFoundError } from '~/shared/errors.server.ts';

export class CoSpeakerTalkInvite {
  constructor(private code: string) {}

  static with(code: string) {
    return new CoSpeakerTalkInvite(code);
  }

  async check() {
    const talk = await db.talk.findUnique({ where: { invitationCode: this.code }, include: { speakers: true } });

    if (!talk) throw new InvitationNotFoundError();

    return {
      id: talk.id,
      title: talk.title,
      description: talk.abstract,
      speakers: talk.speakers.map((speaker) => ({ id: speaker.id, name: speaker.name, picture: speaker.picture })),
    };
  }

  async addCoSpeaker(coSpeakerId: string) {
    const talk = await this.check();

    try {
      await db.talk.update({
        where: { id: talk.id },
        data: { speakers: { connect: { id: coSpeakerId } } },
      });
    } catch (_error) {
      throw new InvitationInvalidOrAccepted();
    }

    return talk;
  }
}
