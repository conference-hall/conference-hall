import type { ProposalRatingData } from '~/schemas/proposal';
import { db } from '../../../libs/db';
import { checkUserRole } from '~/shared-server/organizations/check-user-role.server';

export async function rateProposal(
  orgaSlug: string,
  eventSlug: string,
  proposalId: string,
  userId: string,
  data: ProposalRatingData
) {
  await checkUserRole(orgaSlug, eventSlug, userId);

  await db.rating.upsert({
    where: { userId_proposalId: { userId: userId, proposalId } },
    update: data,
    create: { userId: userId, proposalId, ...data },
  });
}
