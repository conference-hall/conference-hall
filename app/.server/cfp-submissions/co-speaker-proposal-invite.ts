import { db } from 'prisma/db.server.ts';

import { InvitationInvalidOrAccepted, InvitationNotFoundError } from '~/shared/errors.server.ts';
import { EventSpeaker } from '../shared/event-speaker.ts';

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
      speakers: proposal.speakers.map((speaker) => ({
        name: speaker.name,
        picture: speaker.picture,
      })),
      event: {
        id: proposal.event.id,
        name: proposal.event.name,
        slug: proposal.event.slug,
        type: proposal.event.type,
        logoUrl: proposal.event.logoUrl,
        cfpState: proposal.event.cfpState,
        cfpStart: proposal.event.cfpStart,
        cfpEnd: proposal.event.cfpEnd,
      },
    };
  }

  async addCoSpeaker(userId: string) {
    const proposal = await this.check();

    try {
      await db.$transaction(async (trx) => {
        const updated = await EventSpeaker.for(proposal.event.id, trx).addSpeakerToProposal(proposal.id, userId);

        if (updated.talkId) {
          await trx.talk.update({
            where: { id: updated.talkId },
            data: { speakers: { connect: { id: userId } } },
          });
        }
      });
    } catch (_error) {
      throw new InvitationInvalidOrAccepted();
    }

    return proposal;
  }
}
