import { checkOrganizerEventAccess } from './event.server';
import { AcceptationEmailsBatch } from './emails/send-acceptation-emails-batch';
import { RejectionEmailsBatch } from './emails/send-rejection-emails-batch';
import { db } from '../db';

export async function sendAllAcceptationCampaign(orgaSlug: string, eventSlug: string, uid: string) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, ['OWNER', 'MEMBER']);

  const event = await db.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return;

  const proposals = await db.proposal.findMany({
    include: { speakers: true },
    where: { event: { slug: eventSlug }, status: 'ACCEPTED' },
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

  await emails.send();
}

export async function sendAllRejectionCampaign(orgaSlug: string, eventSlug: string, uid: string) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, ['OWNER', 'MEMBER']);

  const event = await db.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return;

  const proposals = await db.proposal.findMany({
    include: { speakers: true },
    where: { event: { slug: eventSlug }, status: 'REJECTED' },
  });

  const emails = new RejectionEmailsBatch(event);

  proposals.forEach((proposal) => {
    proposal.speakers.forEach((speaker) => {
      if (!speaker.email) return;
      emails.addRecipient(speaker.email, { fullname: speaker.name || '', proposalTitle: proposal.title });
    });
  });

  await emails.send();
}
