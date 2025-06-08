import { db } from 'prisma/db.server.ts';
import { sendProposalSubmittedEmailToOrganizers } from '~/emails/templates/organizers/proposal-submitted.tsx';
import { sendProposalSubmittedEmailToSpeakers } from '~/emails/templates/speakers/proposal-submitted.tsx';
import {
  CfpNotOpenError,
  EventNotFoundError,
  MaxSubmittedProposalsReachedError,
  ProposalNotFoundError,
} from '~/libs/errors.server.ts';
import type { Languages } from '~/types/proposals.types.ts';
import { EventSpeaker } from '../shared/event-speaker.ts';
import { TalksLibrary } from '../speaker-talks-library/talks-library.ts';
import type { TalkSaveData } from '../speaker-talks-library/talks-library.types.ts';
import { sendSubmittedTalkSlackMessage } from './slack/slack.services.ts';
import type { TrackUpdateData } from './talk-submission.types.ts';

export class TalkSubmission {
  constructor(
    private userId: string,
    private eventSlug: string,
  ) {}

  static for(userId: string, eventSlug: string) {
    return new TalkSubmission(userId, eventSlug);
  }

  async saveDraft(talkId: string, data: TalkSaveData) {
    const event = await db.event.findUnique({ where: { slug: this.eventSlug } });
    if (!event) throw new EventNotFoundError();
    if (!event.isCfpOpen) throw new CfpNotOpenError();

    const library = TalksLibrary.of(this.userId);
    const talk = talkId === 'new' ? await library.add(data) : await library.talk(talkId).update(data);

    await db.$transaction(async (trx) => {
      const speakers = await EventSpeaker.for(event.id, trx).upsertForUsers(talk.speakers);

      await trx.proposal.upsert({
        where: { talkId_eventId: { talkId: talk.id, eventId: event.id } },
        update: {
          title: talk.title,
          abstract: talk.abstract,
          level: talk.level,
          references: talk.references,
          languages: talk.languages || [],
          speakers: { set: [], connect: speakers.map(({ id }) => ({ id })) },
        },
        create: {
          title: talk.title,
          abstract: talk.abstract,
          level: talk.level,
          references: talk.references,
          languages: talk.languages || [],
          talk: { connect: { id: talk.id } },
          event: { connect: { id: event.id } },
          speakers: { connect: speakers.map(({ id }) => ({ id })) },
        },
      });
      // TODO: check event speakers to delete from event ?
    });

    return { talkId: talk.id };
  }

  async saveTracks(talkId: string, data: TrackUpdateData) {
    const proposal = await db.proposal.findFirst({
      select: { id: true },
      where: { talkId, event: { slug: this.eventSlug }, speakers: { some: { userId: this.userId } } },
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
    const event = await db.event.findUnique({ where: { slug: this.eventSlug }, include: { team: true } });
    if (!event) throw new EventNotFoundError();
    if (!event.isCfpOpen) throw new CfpNotOpenError();

    if (event.maxProposals) {
      const nbProposals = await db.proposal.count({
        where: {
          eventId: event.id,
          speakers: { some: { userId: this.userId } },
          id: { not: { equals: talkId } },
          isDraft: false,
        },
      });
      if (nbProposals >= event.maxProposals) throw new MaxSubmittedProposalsReachedError();
    }

    const proposal = await db.proposal.findFirst({
      where: { talkId, event: { slug: this.eventSlug }, speakers: { some: { userId: this.userId } } },
      include: { speakers: true },
    });
    if (!proposal) throw new ProposalNotFoundError();

    await db.proposal.update({ data: { isDraft: false }, where: { id: proposal.id } });

    await sendProposalSubmittedEmailToSpeakers({ event, proposal });
    await sendProposalSubmittedEmailToOrganizers({ event, proposal });

    if (event.slackWebhookUrl) {
      await sendSubmittedTalkSlackMessage(event.id, proposal.id);
    }
  }

  async get(talkId: string) {
    const proposal = await db.proposal.findFirst({
      include: { talk: true, speakers: true, formats: true, categories: true },
      where: { talkId, event: { slug: this.eventSlug }, speakers: { some: { userId: this.userId } } },
    });
    if (!proposal) throw new ProposalNotFoundError();

    return {
      id: proposal.id,
      title: proposal.title,
      abstract: proposal.abstract,
      level: proposal.level,
      languages: (proposal.languages || []) as Languages,
      references: proposal.references,
      isOwner: this.userId === proposal?.talk?.creatorId,
      invitationLink: proposal.invitationLink,
      createdAt: proposal.createdAt,
      speakers: proposal.speakers
        .map((speaker) => ({
          userId: speaker.userId,
          name: speaker.name,
          bio: speaker.bio,
          picture: speaker.picture,
          isCurrentUser: this.userId === speaker.userId,
        }))
        .sort((a, b) => (a.isCurrentUser ? -1 : 0) - (b.isCurrentUser ? -1 : 0)),
      formats: proposal.formats.map((f) => ({ id: f.id, name: f.name })),
      categories: proposal.categories.map((c) => ({ id: c.id, name: c.name })),
    };
  }

  async removeCoSpeaker(talkId: string, userId: string) {
    const proposal = await db.proposal.findFirst({
      select: { id: true, eventId: true },
      where: { talkId, event: { slug: this.eventSlug }, speakers: { some: { userId: this.userId } } },
    });
    if (!proposal) throw new ProposalNotFoundError();

    await EventSpeaker.for(proposal.eventId).removeSpeakerFromProposal(proposal.id, userId);
  }
}
