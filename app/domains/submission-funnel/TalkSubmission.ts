import { db } from '~/libs/db';
import { CfpNotOpenError } from '~/libs/errors';
import type { TalkSaveData } from '~/routes/__types/talks';

import { CallForPaper } from '../shared/CallForPaper';
import { TalksLibrary } from '../speaker/TalksLibrary';

export class TalkSubmission {
  constructor(
    private speakerId: string,
    private eventSlug: string,
  ) {}

  static for(speakerId: string, eventSlug: string) {
    return new TalkSubmission(speakerId, eventSlug);
  }

  async saveDraft(talkId: string, data: TalkSaveData) {
    const cfp = await CallForPaper.for(this.eventSlug);
    if (!cfp.isOpen) throw new CfpNotOpenError();

    const library = TalksLibrary.of(this.speakerId);
    const talk = talkId === 'new' ? await library.add(data) : await library.talk(talkId).update(data);

    const speakers = talk.speakers.map((speaker) => ({ id: speaker.id }));

    await db.proposal.upsert({
      where: { talkId_eventId: { talkId: talk.id, eventId: cfp.eventId } },
      update: {
        title: talk.title,
        abstract: talk.abstract,
        level: talk.level,
        references: talk.references,
        languages: talk.languages || [],
        speakers: { set: [], connect: speakers },
      },
      create: {
        title: talk.title,
        abstract: talk.abstract,
        level: talk.level,
        references: talk.references,
        languages: talk.languages || [],
        status: 'DRAFT',
        talk: { connect: { id: talk.id } },
        event: { connect: { id: cfp.eventId } },
        speakers: { connect: speakers },
      },
    });

    return { talkId: talk.id };
  }
}
