import { db } from '~/libs/db.ts';
import {
  CfpNotOpenError,
  EventNotFoundError,
  MaxSubmittedProposalsReachedError,
  ProposalNotFoundError,
} from '~/libs/errors.ts';
import type { ProposalSubmissionData } from '~/routes/__types/proposal.ts';
import { getCfpState } from '~/utils/event.ts';

import { ProposalReceivedEmail } from './emails/proposal-received-email.ts';
import { ProposalSubmittedEmail } from './emails/proposal-submitted-email.ts';
import { sendSubmittedTalkSlackMessage } from './slack/slack.services.ts';

export async function submitProposal(talkId: string, eventSlug: string, userId: string, data: ProposalSubmissionData) {
  const event = await db.event.findUnique({ where: { slug: eventSlug } });
  if (!event) throw new EventNotFoundError();

  const isCfpOpen = getCfpState(event.type, event.cfpStart, event.cfpEnd) === 'OPENED';
  if (!isCfpOpen) throw new CfpNotOpenError();

  if (event.maxProposals) {
    const nbProposals = await db.proposal.count({
      where: {
        eventId: event.id,
        speakers: { some: { id: userId } },
        status: { not: { equals: 'DRAFT' } },
        id: { not: { equals: talkId } },
      },
    });
    if (nbProposals >= event.maxProposals) {
      throw new MaxSubmittedProposalsReachedError();
    }
  }

  const proposal = await db.proposal.findFirst({
    where: { eventId: event.id, talkId, speakers: { some: { id: userId } } },
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
