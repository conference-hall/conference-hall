import { EventSpeakerForProposal } from '~/features/event-participation/speaker-proposals/services/event-speaker-for-proposal.ts';
import {
  InvitationInvalidOrAccepted,
  InvitationNotFoundError,
  MaxSpeakersPerProposalReachedError,
} from '~/shared/errors.server.ts';
import { resolveStorageUrl } from '~/shared/storage/storage-utils.ts';
import { db } from '../../../../../prisma/db.server.ts';

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

    const { maxSpeakersPerProposal } = proposal.event;

    return {
      id: proposal.id,
      title: proposal.title,
      description: proposal.abstract,
      speakers: proposal.speakers.map((speaker) => ({
        name: speaker.name,
        picture: speaker.picture,
      })),
      maxSpeakersReached: Boolean(maxSpeakersPerProposal && proposal.speakers.length >= maxSpeakersPerProposal),
      event: {
        id: proposal.event.id,
        name: proposal.event.name,
        slug: proposal.event.slug,
        type: proposal.event.type,
        logoUrl: resolveStorageUrl(proposal.event.logo),
        cfpState: proposal.event.cfpState,
        cfpStart: proposal.event.cfpStart,
        cfpEnd: proposal.event.cfpEnd,
      },
    };
  }

  async addCoSpeaker(userId: string) {
    const proposal = await this.check();
    if (proposal.maxSpeakersReached) throw new MaxSpeakersPerProposalReachedError();

    try {
      await db.$transaction(async (trx) => {
        const updated = await EventSpeakerForProposal.for(proposal.event.id, trx).addSpeakerToProposal(
          proposal.id,
          userId,
        );

        if (updated.talkId) {
          await trx.talk.update({
            where: { id: updated.talkId },
            data: { speakers: { connect: { id: userId } } },
          });
        }
      });
    } catch {
      throw new InvitationInvalidOrAccepted();
    }

    return proposal;
  }
}
