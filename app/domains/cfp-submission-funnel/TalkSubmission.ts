import { db } from '~/libs/db';
import {
  CfpNotOpenError,
  EventNotFoundError,
  MaxSubmittedProposalsReachedError,
  ProposalNotFoundError,
} from '~/libs/errors';

import { CallForPaper } from '../shared/CallForPaper';
import { InvitationLink } from '../shared/InvitationLink';
import { TalksLibrary } from '../speaker-talks-library/TalksLibrary';
import { ProposalReceivedEmail } from './emails/proposal-received-email';
import { ProposalSubmittedEmail } from './emails/proposal-submitted-email';
import { sendSubmittedTalkSlackMessage } from './slack/slack.services';
import type { DraftSaveData, TrackUpdateData } from './TalkSubmission.types';

export class TalkSubmission {
  constructor(
    private speakerId: string,
    private eventSlug: string,
  ) {}

  static for(speakerId: string, eventSlug: string) {
    return new TalkSubmission(speakerId, eventSlug);
  }

  async saveDraft(talkId: string, data: DraftSaveData) {
    const event = await db.event.findUnique({ where: { slug: this.eventSlug } });
    if (!event) throw new EventNotFoundError();

    const cfp = new CallForPaper(event);
    if (!cfp.isOpen) throw new CfpNotOpenError();

    const library = TalksLibrary.of(this.speakerId);
    const talk = talkId === 'new' ? await library.add(data) : await library.talk(talkId).update(data);

    const speakers = talk.speakers.map((speaker) => ({ id: speaker.id }));

    await db.proposal.upsert({
      where: { talkId_eventId: { talkId: talk.id, eventId: event.id } },
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
        event: { connect: { id: event.id } },
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
    const event = await db.event.findUnique({ where: { slug: this.eventSlug } });
    if (!event) throw new EventNotFoundError();

    const cfp = new CallForPaper(event);
    if (!cfp.isOpen) throw new CfpNotOpenError();

    if (event.maxProposals) {
      const nbProposals = await db.proposal.count({
        where: {
          eventId: event.id,
          speakers: { some: { id: this.speakerId } },
          status: { not: { equals: 'DRAFT' } },
          id: { not: { equals: talkId } },
        },
      });
      if (nbProposals >= event.maxProposals) throw new MaxSubmittedProposalsReachedError();
    }

    const proposal = await db.proposal.findFirst({
      where: { talkId, event: { slug: this.eventSlug }, speakers: { some: { id: this.speakerId } } },
      include: { event: true, speakers: true },
    });
    if (!proposal) throw new ProposalNotFoundError();

    await db.proposal.update({ data: { status: 'SUBMITTED' }, where: { id: proposal.id } });

    await ProposalSubmittedEmail.send(proposal.event, proposal);
    await ProposalReceivedEmail.send(proposal.event, proposal);

    if (proposal.event.slackWebhookUrl) {
      await sendSubmittedTalkSlackMessage(proposal.eventId, proposal.id);
    }
  }

  async get(talkId: string) {
    const proposal = await db.proposal.findFirst({
      include: { talk: true, speakers: true, formats: true, categories: true },
      where: { talkId, event: { slug: this.eventSlug }, speakers: { some: { id: this.speakerId } } },
    });
    if (!proposal) throw new ProposalNotFoundError();

    return {
      id: proposal.id,
      title: proposal.title,
      isOwner: this.speakerId === proposal?.talk?.creatorId,
      invitationLink: InvitationLink.build('proposal', proposal.invitationCode),
      speakers: proposal.speakers
        .map((speaker) => ({
          id: speaker.id,
          name: speaker.name,
          picture: speaker.picture,
          isOwner: speaker.id === proposal?.talk?.creatorId,
        }))
        .sort((a, b) => (a.isOwner ? -1 : 0) - (b.isOwner ? -1 : 0)),
      formats: proposal.formats.map((f) => ({ id: f.id, name: f.name })),
      categories: proposal.categories.map((c) => ({ id: c.id, name: c.name })),
    };
  }

  async removeCoSpeaker(talkId: string, coSpeakerId: string) {
    const proposal = await db.proposal.findFirst({
      select: { id: true },
      where: { talkId, event: { slug: this.eventSlug }, speakers: { some: { id: this.speakerId } } },
    });
    if (!proposal) throw new ProposalNotFoundError();

    await db.proposal.update({
      where: { id: proposal.id },
      data: { speakers: { disconnect: { id: coSpeakerId } } },
    });
  }
}
