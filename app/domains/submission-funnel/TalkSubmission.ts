import { db } from '~/libs/db';
import { CfpNotOpenError, MaxSubmittedProposalsReachedError, ProposalNotFoundError } from '~/libs/errors';
import type { TalkSaveData } from '~/routes/__types/talks';

import { CallForPaper } from '../shared/CallForPaper';
import { TalksLibrary } from '../speaker/TalksLibrary';
import type { TrackUpdateData } from './TalkSubmission.types';

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

  async saveTracks(talkId: string, data: TrackUpdateData) {
    const proposal = await db.proposal.findFirst({
      select: { id: true },
      where: { talkId, event: { slug: this.eventSlug }, speakers: { some: { id: this.speakerId } } },
    });
    if (!proposal) throw new ProposalNotFoundError();

    await db.proposal.update({
      where: { id: proposal.id },
      data: {
        formats: { set: [], connect: data.formats?.map((f) => ({ id: f })) },
        categories: { set: [], connect: data.categories?.map((c) => ({ id: c })) },
      },
    });
  }

  async submit(talkId: string) {
    const cfp = await CallForPaper.for(this.eventSlug);
    if (!cfp.isOpen) throw new CfpNotOpenError();

    if (cfp.maxProposals) {
      const nbProposals = await db.proposal.count({
        where: {
          eventId: cfp.eventId,
          speakers: { some: { id: this.speakerId } },
          status: { not: { equals: 'DRAFT' } },
          id: { not: { equals: talkId } },
        },
      });
      if (nbProposals >= cfp.maxProposals) throw new MaxSubmittedProposalsReachedError();
    }

    const proposal = await db.proposal.findFirst({
      select: { id: true },
      where: { talkId, event: { slug: this.eventSlug }, speakers: { some: { id: this.speakerId } } },
    });
    if (!proposal) throw new ProposalNotFoundError();

    await db.proposal.update({ data: { status: 'SUBMITTED' }, where: { id: proposal.id } });

    // await ProposalSubmittedEmail.send(event, proposal);
    // await ProposalReceivedEmail.send(event, proposal);

    // if (event.slackWebhookUrl) {
    //   await sendSubmittedTalkSlackMessage(cfp.eventId, proposal.id);
    // }
  }
}
