import { db } from '~/libs/db';
import type { ProposalRatingData } from '~/schemas/proposal';
import { allowedForEvent } from '~/shared-server/organizations/check-user-role.server';

export async function rateProposal(eventSlug: string, proposalId: string, userId: string, data: ProposalRatingData) {
  await allowedForEvent(eventSlug, userId);

  await db.rating.upsert({
    where: { userId_proposalId: { userId: userId, proposalId } },
    update: data,
    create: { userId: userId, proposalId, ...data },
  });
}
