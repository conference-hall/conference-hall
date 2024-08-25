import { db } from 'prisma/db.server.ts';

import { SpeakerTalk } from './speaker-talk.ts';
import type { TalkSaveData, TalksListFilter } from './talks-library.types.ts';

export class TalksLibrary {
  constructor(private speakerId: string) {}

  static of(speakerId: string) {
    return new TalksLibrary(speakerId);
  }

  talk(talkId: string) {
    return new SpeakerTalk(this.speakerId, talkId);
  }

  async list(filter: TalksListFilter = 'active') {
    const talks = await db.talk.findMany({
      where: {
        speakers: { some: { id: this.speakerId } },
        archived: filter === 'active' ? false : filter === 'archived' ? true : undefined,
      },
      include: { speakers: true },
      orderBy: { updatedAt: 'desc' },
    });

    return talks.map((talk) => ({
      id: talk.id,
      title: talk.title,
      archived: talk.archived,
      createdAt: talk.createdAt.toISOString(),
      speakers: talk.speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        picture: speaker.picture,
      })),
    }));
  }

  async listForEvent(eventSlug: string) {
    const talks = await db.talk.findMany({
      include: { speakers: true },
      where: {
        speakers: { some: { id: this.speakerId } },
        proposals: { none: { event: { slug: eventSlug } } },
        archived: false,
      },
      orderBy: { title: 'asc' },
    });

    return talks.map((talk) => ({
      id: talk.id,
      title: talk.title,
      speakers: talk.speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        picture: speaker.picture,
      })),
    }));
  }

  async add(data: TalkSaveData) {
    return db.talk.create({
      data: {
        ...data,
        creator: { connect: { id: this.speakerId } },
        speakers: { connect: [{ id: this.speakerId }] },
      },
      include: { speakers: true },
    });
  }
}
