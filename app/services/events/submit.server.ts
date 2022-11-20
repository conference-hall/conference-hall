import { db } from '../db';
import { getCfpState } from '../../utils/event';
import {
  CfpNotOpenError,
  EventNotFoundError,
  MaxSubmittedProposalsReachedError,
  ProposalNotFoundError,
  TalkNotFoundError,
} from '../errors';
import type { ProposalCreateData, ProposalSubmissionData } from '~/schemas/proposal';
import { ProposalSubmittedEmail } from './emails/proposal-submitted-email';
import { ProposalReceivedEmail } from './emails/proposal-received-email';
import { sendSubmittedTalkSlackMessage } from '../slack/slack.services';

export async function saveDraftProposalForEvent(
  talkId: string,
  eventSlug: string,
  uid: string,
  data: ProposalCreateData
) {
  if (talkId !== 'new') {
    const talk = await db.talk.findFirst({
      where: { id: talkId, speakers: { some: { id: uid } } },
    });
    if (!talk) throw new TalkNotFoundError();
  }

  const event = await db.event.findUnique({
    select: { id: true, type: true, cfpStart: true, cfpEnd: true },
    where: { slug: eventSlug },
  });
  if (!event) throw new EventNotFoundError();

  const isCfpOpen = getCfpState(event.type, event.cfpStart, event.cfpEnd) === 'OPENED';
  if (!isCfpOpen) throw new CfpNotOpenError();

  const talk = await db.talk.upsert({
    where: { id: talkId },
    update: { ...data },
    create: {
      ...data,
      creator: { connect: { id: uid } },
      speakers: { connect: [{ id: uid }] },
    },
    include: { speakers: true },
  });

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

export async function getProposalInfo(talkId: string, eventId: string, uid: string) {
  const proposal = await db.proposal.findFirst({
    select: { title: true, formats: true, categories: true, speakers: true },
    where: { talkId, eventId, speakers: { some: { id: uid } } },
  });
  if (!proposal) throw new ProposalNotFoundError();

  return {
    title: proposal.title,
    speakers: proposal.speakers.map((s) => ({
      name: s.name,
      photoURL: s.photoURL,
    })),
    formats: proposal.formats.map((f) => f.name),
    categories: proposal.categories.map((c) => c.name),
  };
}

export async function submitProposal(talkId: string, eventSlug: string, uid: string, data: ProposalSubmissionData) {
  const event = await db.event.findUnique({ where: { slug: eventSlug } });
  if (!event) throw new EventNotFoundError();

  const isCfpOpen = getCfpState(event.type, event.cfpStart, event.cfpEnd) === 'OPENED';
  if (!isCfpOpen) throw new CfpNotOpenError();

  if (event.maxProposals) {
    const nbProposals = await db.proposal.count({
      where: {
        eventId: event.id,
        speakers: { some: { id: uid } },
        status: { not: { equals: 'DRAFT' } },
        id: { not: { equals: talkId } },
      },
    });
    if (nbProposals >= event.maxProposals) {
      throw new MaxSubmittedProposalsReachedError();
    }
  }

  const proposal = await db.proposal.findFirst({
    where: { eventId: event.id, talkId, speakers: { some: { id: uid } } },
    include: { speakers: true },
  });
  if (!proposal) throw new ProposalNotFoundError();

  await db.proposal.update({
    data: { status: 'SUBMITTED', comments: data.message },
    where: { id: proposal.id },
  });

  await ProposalSubmittedEmail.send(event, proposal);
  await ProposalReceivedEmail.send(event, proposal);

  if (event.slackWebhookUrl) {
    await sendSubmittedTalkSlackMessage(event.id, proposal.id);
  }
}
