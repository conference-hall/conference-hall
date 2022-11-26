import { EmailStatus } from '@prisma/client';
import { db } from '../../libs/db';
import { checkAccess } from '../organizer-event/check-access.server';
import { ProposalRejectedEmailsBatch } from './emails/proposal-rejected-email-batch';

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
