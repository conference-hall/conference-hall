import { EmailStatus } from '@prisma/client';

import { db } from '~/libs/db.ts';

import { ProposalAcceptedEmailsBatch } from './emails/proposal-accepted-email-batch.ts';

export async function sendAcceptationCampaign(eventSlug: string, userId: string, proposalIds: string[]) {
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
