import { checkOrganizerEventAccess } from './event.server';
import { AcceptationEmailsBatch } from './emails/send-acceptation-emails-batch';
import { RejectionEmailsBatch } from './emails/send-rejection-emails-batch';
import { db } from '../db';
import { EmailStatus } from '@prisma/client';

export async function getAcceptationCampaignStats(orgaSlug: string, eventSlug: string, uid: string) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, ['OWNER', 'MEMBER']);

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
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, ['OWNER', 'MEMBER']);

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

  await new AcceptationEmailsBatch(event, proposals).send();

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
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, ['OWNER', 'MEMBER']);

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
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, ['OWNER', 'MEMBER']);

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

  await new RejectionEmailsBatch(event, proposals).send();

  await db.proposal.updateMany({
    data: { emailRejectedStatus: EmailStatus.SENT },
    where: {
      event: { slug: eventSlug },
      id: { in: proposalIds?.length > 0 ? proposalIds : undefined },
      status: 'REJECTED',
    },
  });
}
