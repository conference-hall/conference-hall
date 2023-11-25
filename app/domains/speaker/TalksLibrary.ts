import { db } from '~/libs/db';
import type { TalkSaveData } from '~/routes/__types/talks';

import { SpeakerTalk } from './SpeakerTalk';

type TalksListOptions = { archived?: boolean };

export class TalksLibrary {
  constructor(private speakerId: string) {}

  static of(speakerId: string) {
    return new TalksLibrary(speakerId);
  }

  talk(talkId: string) {
    return new SpeakerTalk(this.speakerId, talkId);
  }

  async list(options: TalksListOptions = { archived: false }) {
    const talks = await db.talk.findMany({
      where: {
        speakers: { some: { id: this.speakerId } },
        archived: Boolean(options.archived),
      },
      include: { speakers: true },
      orderBy: { updatedAt: 'desc' },
    });

    return talks.map((talk) => ({
      id: talk.id,
      title: talk.title,
      archived: talk.archived,
      createdAt: talk.createdAt.toUTCString(),
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
    });
  }
}
