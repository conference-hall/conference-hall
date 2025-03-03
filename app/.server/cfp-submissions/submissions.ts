import { db } from 'prisma/db.server.ts';

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
        newSpeakers: { some: { userId: this.speakerId } },
        isDraft: false,
      },
    });
  }

  async list() {
    const proposals = await db.proposal.findMany({
      where: {
        newSpeakers: { some: { userId: this.speakerId } },
        event: { slug: this.eventSlug },
      },
      include: { newSpeakers: true, event: true },
      orderBy: { createdAt: 'desc' },
    });

    return proposals.map((proposal) => ({
      id: proposal.id,
      title: proposal.title,
      talkId: proposal.talkId,
      status: proposal.getStatusForSpeaker(proposal.event.isCfpOpen),
      createdAt: proposal.createdAt,
      speakers: proposal.newSpeakers.map((speaker) => ({
        name: speaker.name,
        picture: speaker.picture,
      })),
    }));
  }

  async drafts() {
    const drafts = await db.proposal.findMany({
      include: { newSpeakers: true },
      where: {
        event: { slug: this.eventSlug },
        newSpeakers: { some: { userId: this.speakerId } },
        isDraft: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return drafts.map((draft) => ({
      id: draft.talkId!,
      title: draft.title,
      speakers: draft.newSpeakers.map((speaker) => ({
        name: speaker.name,
        picture: speaker.picture,
      })),
    }));
  }
}
