import { db } from 'prisma/db.server.ts';
import { sendTalkToSlack } from '~/features/event-participation/cfp-submission/services/send-talk-to-slack.job.ts';
import { EventSpeakerForProposal } from '~/features/event-participation/speaker-proposals/services/event-speaker-for-proposal.ts';
import { TalksLibrary } from '~/features/speaker/talk-library/services/talks-library.server.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import OrganizerProposalSubmittedEmail from '~/shared/emails/templates/organizers/proposal-submitted.tsx';
import SpeakerProposalSubmittedEmail from '~/shared/emails/templates/speakers/proposal-submitted.tsx';
import {
  CfpNotOpenError,
  EventNotFoundError,
  MaxSubmittedProposalsReachedError,
  ProposalNotFoundError,
} from '~/shared/errors.server.ts';
import type { EventEmailNotificationsKeys } from '~/shared/types/events.types.ts';
import type { Languages } from '~/shared/types/proposals.types.ts';
import type { TalkSaveData, TrackSaveData } from '~/shared/types/speaker-talk.types.ts';

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
      const speakers = await EventSpeakerForProposal.for(event.id, trx).upsertForUsers(talk.speakers);

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

  async saveTracks(talkId: string, data: TrackSaveData) {
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

    // send speaker email
    await sendEmail.trigger(SpeakerProposalSubmittedEmail.buildPayload({ event, proposal }));

    // send organizer email
    const emailNotifications = event.emailNotifications as EventEmailNotificationsKeys;
    if (emailNotifications.includes('submitted') && event.emailOrganizer) {
      await sendEmail.trigger(OrganizerProposalSubmittedEmail.buildPayload({ event, proposal }));
    }

    // send slack message
    if (event.slackWebhookUrl) {
      await sendTalkToSlack.trigger({ eventId: event.id, proposalId: proposal.id });
    }

    return proposal.id;
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

    await EventSpeakerForProposal.for(proposal.eventId).removeSpeakerFromProposal(proposal.id, userId);
  }
}
