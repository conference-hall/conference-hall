import { checkOrganizerEventAccess } from './event.server';
import { AcceptationEmailsBatch } from '../emails/templates/send-acceptation-emails-batch';
import { db } from '../db';
import { RejectionEmailsBatch } from '../emails/templates/send-rejection-emails-batch';

export async function sendAllAcceptationCampaign(orgaSlug: string, eventSlug: string, uid: string) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, ['OWNER', 'MEMBER']);

  const event = await db.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return;

  const proposals = await db.proposal.findMany({
    include: { speakers: true },
    where: { event: { slug: eventSlug }, status: { in: ['ACCEPTED'], not: 'DRAFT' } },
  });

  const emails = new AcceptationEmailsBatch(event);

  proposals.forEach((proposal) => {
    proposal.speakers.forEach((speaker) => {
      if (!speaker.email) return;
      emails.addRecipient(speaker.email, {
        fullname: speaker.name || '',
        proposalId: proposal.id,
        proposalTitle: proposal.title,
      });
    });
  });

  emails.send();
}

export async function sendAllRejectionCampaign(orgaSlug: string, eventSlug: string, uid: string) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, ['OWNER', 'MEMBER']);

  const event = await db.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return;

  const proposals = await db.proposal.findMany({
    include: { speakers: true },
    where: { event: { slug: eventSlug }, status: { in: ['REJECTED'], not: 'DRAFT' } },
  });

  const emails = new RejectionEmailsBatch(event);

  proposals.forEach((proposal) => {
    proposal.speakers.forEach((speaker) => {
      if (!speaker.email) return;
      emails.addRecipient(speaker.email, { fullname: speaker.name || '', proposalTitle: proposal.title });
    });
  });

  emails.send();
}
