import { db } from 'prisma/db.server.ts';

import { TalkNotFoundError } from '~/libs/errors.server.ts';

import type { TalkSaveData } from './talks-library.types';

export class SpeakerTalk {
  constructor(
    private speakerId: string,
    private talkId: string,
  ) {}

  static for(speakerId: string, talkId: string) {
    return new SpeakerTalk(speakerId, talkId);
  }

  async get() {
    const talk = await db.talk.findFirst({
      where: {
        speakers: { some: { id: this.speakerId } },
        id: this.talkId,
      },
      include: {
        speakers: true,
        proposals: { include: { event: true } },
      },
    });
    if (!talk) throw new TalkNotFoundError();

    return {
      id: talk.id,
      title: talk.title,
      abstract: talk.abstract,
      level: talk.level,
      languages: (talk.languages || []) as string[],
      references: talk.references,
      archived: talk.archived,
      createdAt: talk.createdAt,
      isOwner: this.speakerId === talk.creatorId,
      speakers: talk.speakers
        .map((speaker) => ({
          id: speaker.id,
          name: speaker.name,
          picture: speaker.picture,
          company: speaker.company,
          bio: speaker.bio,
          isOwner: speaker.id === talk.creatorId,
          isCurrentUser: speaker.id === this.speakerId,
        }))
        .sort((a, b) => (a.isOwner ? -1 : 0) - (b.isOwner ? -1 : 0)),
      submissions: talk.proposals
        .map((proposal) => ({
          slug: proposal.event.slug,
          name: proposal.event.name,
          logoUrl: proposal.event.logoUrl,
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
        legacySpeakers: { some: { id: this.speakerId } },
        isDraft: false,
      },
    });
    return count > 0;
  }

  private async allowed(talkId: string) {
    const count = await db.talk.count({ where: { id: talkId, speakers: { some: { id: this.speakerId } } } });
    return count > 0;
  }
}
