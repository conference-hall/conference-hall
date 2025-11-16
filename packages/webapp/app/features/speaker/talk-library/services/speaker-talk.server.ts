import { db } from '@conference-hall/database';
import type { Languages } from '@conference-hall/shared/types/proposals.types.ts';
import { TalkNotFoundError } from '~/shared/errors.server.ts';
import type { TalkSaveData } from './talks-library.schema.server.ts';

export class SpeakerTalk {
  constructor(
    private userId: string,
    private talkId: string,
  ) {}

  static for(speakerId: string, talkId: string) {
    return new SpeakerTalk(speakerId, talkId);
  }

  async get() {
    const talk = await db.talk.findFirst({
      where: {
        speakers: { some: { id: this.userId } },
        id: this.talkId,
      },
      include: {
        speakers: true,
        proposals: {
          where: { speakers: { some: { userId: this.userId } } },
          include: { event: true },
        },
      },
    });
    if (!talk) throw new TalkNotFoundError();

    return {
      id: talk.id,
      title: talk.title,
      abstract: talk.abstract,
      level: talk.level,
      languages: (talk.languages || []) as Languages,
      references: talk.references,
      archived: talk.archived,
      createdAt: talk.createdAt,
      isOwner: this.userId === talk.creatorId,
      speakers: talk.speakers
        .map((user) => ({
          userId: user.id,
          name: user.name,
          picture: user.picture,
          company: user.company,
          bio: user.bio,
          isOwner: user.id === talk.creatorId,
          isCurrentUser: user.id === this.userId,
        }))
        .sort((a, b) => (a.isOwner ? -1 : 0) - (b.isOwner ? -1 : 0)),
      submissions: talk.proposals
        .map((proposal) => ({
          slug: proposal.event.slug,
          name: proposal.event.name,
          logoUrl: proposal.event.logoUrl,
          proposalId: proposal.id,
          proposalStatus: proposal.getStatusForSpeaker(proposal.event.isCfpOpen),
          createdAt: proposal.createdAt,
        }))
        .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)),
      invitationLink: talk.invitationLink,
    };
  }

  async update(data: TalkSaveData) {
    const exists = await this.allowed(this.talkId);
    if (!exists) throw new TalkNotFoundError();

    return db.talk.update({ where: { id: this.talkId }, data, include: { speakers: true } });
  }

  async archive() {
    const exists = await this.allowed(this.talkId);
    if (!exists) throw new TalkNotFoundError();

    return db.talk.update({ where: { id: this.talkId }, data: { archived: true } });
  }

  async restore() {
    const exits = await this.allowed(this.talkId);
    if (!exits) throw new TalkNotFoundError();

    return db.talk.update({ where: { id: this.talkId }, data: { archived: false } });
  }

  async removeCoSpeaker(coSpeakerId: string) {
    const exits = await this.allowed(this.talkId);
    if (!exits) throw new TalkNotFoundError();

    await db.talk.update({
      where: { id: this.talkId },
      data: { speakers: { disconnect: { id: coSpeakerId } } },
    });
  }

  async isSubmittedTo(eventSlug: string) {
    const count = await db.proposal.count({
      where: {
        talk: { id: this.talkId },
        event: { slug: eventSlug },
        speakers: { some: { userId: this.userId } },
        isDraft: false,
      },
    });
    return count > 0;
  }

  private async allowed(talkId: string) {
    const count = await db.talk.count({ where: { id: talkId, speakers: { some: { id: this.userId } } } });
    return count > 0;
  }
}
