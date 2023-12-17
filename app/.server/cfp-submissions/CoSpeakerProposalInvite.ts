import { db } from 'prisma/db.server';
import { InvitationInvalidOrAccepted, InvitationNotFoundError } from '~/libs/errors.server';

export class CoSpeakerProposalInvite {
  constructor(private code: string) {}

  static with(code: string) {
    return new CoSpeakerProposalInvite(code);
  }

  async check() {
    const proposal = await db.proposal.findUnique({
      include: { event: true },
      where: { invitationCode: this.code },
    });
    if (!proposal) throw new InvitationNotFoundError();

    return proposal;
  }

  async addCoSpeaker(coSpeakerId: string) {
    const proposal = await this.check();

    try {
      await db.$transaction(async (trx) => {
        const updated = await trx.proposal.update({
          where: { id: proposal.id },
          data: { speakers: { connect: { id: coSpeakerId } } },
        });

        if (updated.talkId) {
          await trx.talk.update({
            where: { id: updated.talkId },
            data: { speakers: { connect: { id: coSpeakerId } } },
          });
        }
      });
    } catch (e) {
      throw new InvitationInvalidOrAccepted();
    }

    return proposal;
  }
}
