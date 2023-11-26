import { getSpeakerProposalStatus } from '~/domains/cfp-submissions/get-speaker-proposal-status';
import { db } from '~/libs/db';

export class Submissions {
  constructor(
    private speakerId: string,
    private eventSlug: string,
  ) {}

  static for(speakerId: string, eventSlug: string) {
    return new Submissions(speakerId, eventSlug);
  }

  async count() {
    return db.proposal.count({
      where: {
        event: { slug: this.eventSlug },
        speakers: { some: { id: this.speakerId } },
        status: { not: { equals: 'DRAFT' } },
      },
    });
  }

  async list() {
    const proposals = await db.proposal.findMany({
      where: {
        speakers: { some: { id: this.speakerId } },
        event: { slug: this.eventSlug },
      },
      include: { speakers: true, event: true },
      orderBy: { createdAt: 'desc' },
    });

    return proposals.map((proposal) => ({
      id: proposal.id,
      title: proposal.title,
      talkId: proposal.talkId,
      status: getSpeakerProposalStatus(proposal, proposal.event),
      createdAt: proposal.createdAt.toUTCString(),
      speakers: proposal.speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        picture: speaker.picture,
      })),
    }));
  }

  async drafts() {
    const drafts = await db.proposal.findMany({
      include: { speakers: true },
      where: { event: { slug: this.eventSlug }, speakers: { some: { id: this.speakerId } }, status: 'DRAFT' },
      orderBy: { createdAt: 'desc' },
    });

    return drafts.map((draft) => ({
      id: draft.talkId!,
      title: draft.title,
      speakers: draft.speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        picture: speaker.picture,
      })),
    }));
  }
}
