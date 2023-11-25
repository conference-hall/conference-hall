import { db } from '~/libs/db';

export class SpeakerProposals {
  constructor(
    private speakerId: string,
    private eventSlug: string,
  ) {}

  static for(speakerId: string, eventSlug: string) {
    return new SpeakerProposals(speakerId, eventSlug);
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
