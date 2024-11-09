import { db } from 'prisma/db.server.ts';

import { InvitationInvalidOrAccepted, InvitationNotFoundError } from '~/libs/errors.server.ts';

export class CoSpeakerProposalInvite {
  constructor(private code: string) {}

  static with(code: string) {
    return new CoSpeakerProposalInvite(code);
  }

  async check() {
    const proposal = await db.proposal.findUnique({
      include: { event: true, speakers: true },
      where: { invitationCode: this.code },
    });
    if (!proposal) throw new InvitationNotFoundError();

    return {
      id: proposal.id,
      title: proposal.title,
      description: proposal.abstract,
      speakers: proposal.speakers.map((speaker) => ({ id: speaker.id, name: speaker.name, picture: speaker.picture })),
      event: {
        name: proposal.event.name,
        slug: proposal.event.slug,
        type: proposal.event.type,
        logoUrl: proposal.event.logoUrl,
        cfpState: proposal.event.cfpState,
        cfpStart: proposal.event.cfpStart?.toISOString(),
        cfpEnd: proposal.event.cfpEnd?.toISOString(),
      },
    };
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
    } catch (_error) {
      throw new InvitationInvalidOrAccepted();
    }

    return proposal;
  }
}
