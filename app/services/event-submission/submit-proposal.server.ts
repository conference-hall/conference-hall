import { db } from '../db';
import { getCfpState } from '../../utils/event';
import {
  CfpNotOpenError,
  EventNotFoundError,
  MaxSubmittedProposalsReachedError,
  ProposalNotFoundError,
} from '../errors';
import type { ProposalSubmissionData } from '~/schemas/proposal';
import { ProposalSubmittedEmail } from './emails/proposal-submitted-email';
import { ProposalReceivedEmail } from './emails/proposal-received-email';
import { sendSubmittedTalkSlackMessage } from './slack/slack.services';

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
