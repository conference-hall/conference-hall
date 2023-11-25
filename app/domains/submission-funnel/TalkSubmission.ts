import { db } from '~/libs/db';

export class TalkSubmission {
  constructor(
    private speakerId: string,
    private eventSlug: string,
  ) {}

  static for(speakerId: string, eventSlug: string) {
    return new TalkSubmission(speakerId, eventSlug);
  }

  async isAlreadySubmitted(talkId: string) {
    const count = await db.proposal.count({
      where: {
        talk: { id: talkId },
        event: { slug: this.eventSlug },
        status: { not: 'DRAFT' },
        speakers: { some: { id: this.speakerId } },
      },
    });
    return count > 0;
  }
}
