import { ProposalAcceptedEmailsBatch } from './emails/proposal-accepted-email-batch';
import { ProposalRejectedEmailsBatch } from './emails/proposal-rejected-email-batch';
import { db } from '../db';
import { EmailStatus } from '@prisma/client';
import { checkAccess } from '../organizer-event/check-access.server';

export async function getAcceptationCampaignStats(orgaSlug: string, eventSlug: string, uid: string) {
  await checkAccess(orgaSlug, eventSlug, uid, ['OWNER', 'MEMBER']);

  const toSend = await db.proposal.count({
    where: {
      event: { slug: eventSlug },
      status: { in: ['ACCEPTED', 'CONFIRMED', 'DECLINED'] },
      emailAcceptedStatus: null,
    },
  });
  const sentStatusCount = await db.proposal.count({
    where: {
      event: { slug: eventSlug },
      status: { in: ['ACCEPTED', 'CONFIRMED', 'DECLINED'] },
      emailAcceptedStatus: 'SENT',
    },
  });
  const deliveredStatusCount = await db.proposal.count({
    where: {
      event: { slug: eventSlug },
      status: { in: ['ACCEPTED', 'CONFIRMED', 'DECLINED'] },
      emailAcceptedStatus: 'DELIVERED',
    },
  });

  return { toSend, sent: sentStatusCount + deliveredStatusCount, delivered: deliveredStatusCount };
}

export async function sendAcceptationCampaign(orgaSlug: string, eventSlug: string, uid: string, proposalIds: string[]) {
  await checkAccess(orgaSlug, eventSlug, uid, ['OWNER', 'MEMBER']);

  const event = await db.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return;

  const proposals = await db.proposal.findMany({
    include: { speakers: true },
    where: {
      event: { slug: eventSlug },
      id: { in: proposalIds?.length > 0 ? proposalIds : undefined },
      status: 'ACCEPTED',
    },
  });

  await ProposalAcceptedEmailsBatch.send(event, proposals);

  await db.proposal.updateMany({
    data: { emailAcceptedStatus: EmailStatus.SENT },
    where: {
      event: { slug: eventSlug },
      id: { in: proposalIds?.length > 0 ? proposalIds : undefined },
      status: 'ACCEPTED',
    },
  });
}

export async function getRejectionCampaignStats(orgaSlug: string, eventSlug: string, uid: string) {
  await checkAccess(orgaSlug, eventSlug, uid, ['OWNER', 'MEMBER']);

  const toSend = await db.proposal.count({
    where: { event: { slug: eventSlug }, status: 'REJECTED', emailRejectedStatus: null },
  });
  const sentStatusCount = await db.proposal.count({
    where: { event: { slug: eventSlug }, status: 'REJECTED', emailRejectedStatus: 'SENT' },
  });
  const deliveredStatusCount = await db.proposal.count({
    where: { event: { slug: eventSlug }, status: 'REJECTED', emailRejectedStatus: 'DELIVERED' },
  });

  return { toSend, sent: sentStatusCount + deliveredStatusCount, delivered: deliveredStatusCount };
}

export async function sendRejectionCampaign(orgaSlug: string, eventSlug: string, uid: string, proposalIds: string[]) {
  await checkAccess(orgaSlug, eventSlug, uid, ['OWNER', 'MEMBER']);

  const event = await db.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return;

  const proposals = await db.proposal.findMany({
    include: { speakers: true },
    where: {
      event: { slug: eventSlug },
      id: { in: proposalIds?.length > 0 ? proposalIds : undefined },
      status: 'REJECTED',
    },
  });

  await ProposalRejectedEmailsBatch.send(event, proposals);

  await db.proposal.updateMany({
    data: { emailRejectedStatus: EmailStatus.SENT },
    where: {
      event: { slug: eventSlug },
      id: { in: proposalIds?.length > 0 ? proposalIds : undefined },
      status: 'REJECTED',
    },
  });
}
