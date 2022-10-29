import { checkOrganizerEventAccess } from './event.server';
import { AcceptationEmailsBatch } from './emails/send-acceptation-emails-batch';
import { RejectionEmailsBatch } from './emails/send-rejection-emails-batch';
import { db } from '../db';
import { EmailStatus } from '@prisma/client';

export async function sendAllAcceptationCampaign(orgaSlug: string, eventSlug: string, uid: string) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, ['OWNER', 'MEMBER']);

  const event = await db.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return;

  const proposals = await db.proposal.findMany({
    include: { speakers: true },
    where: { event: { slug: eventSlug }, status: 'ACCEPTED' },
  });

  await new AcceptationEmailsBatch(event, proposals).send();

  await db.proposal.updateMany({
    data: { emailAcceptedStatus: EmailStatus.SENT },
    where: { event: { slug: eventSlug }, status: 'ACCEPTED' },
  });
}

export async function sendAllRejectionCampaign(orgaSlug: string, eventSlug: string, uid: string) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, ['OWNER', 'MEMBER']);

  const event = await db.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return;

  const proposals = await db.proposal.findMany({
    include: { speakers: true },
    where: { event: { slug: eventSlug }, status: 'REJECTED' },
  });

  await new RejectionEmailsBatch(event, proposals).send();

  await db.proposal.updateMany({
    data: { emailRejectedStatus: EmailStatus.SENT },
    where: { event: { slug: eventSlug }, status: 'REJECTED' },
  });
}
