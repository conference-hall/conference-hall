import { EmailStatus, TeamRole } from '@prisma/client';
import { ProposalAcceptedEmailsBatch } from './emails/proposal-accepted-email-batch';
import { allowedForEvent } from '~/server/teams/check-user-role.server';
import { db } from '~/libs/db';

export async function sendAcceptationCampaign(eventSlug: string, userId: string, proposalIds: string[]) {
  await allowedForEvent(eventSlug, userId, [TeamRole.OWNER, TeamRole.MEMBER]);

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
