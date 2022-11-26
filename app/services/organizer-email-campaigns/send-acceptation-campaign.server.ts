import { ProposalAcceptedEmailsBatch } from './emails/proposal-accepted-email-batch';
import { db } from '../../libs/db';
import { EmailStatus } from '@prisma/client';
import { checkAccess } from '../organizer-event/check-access.server';

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
