import type { ProposalRatingData } from '~/schemas/proposal';
import { db } from '../../../libs/db';
import { checkUserRole } from '~/shared/organizations/check-user-role.server';

export async function rateProposal(
  orgaSlug: string,
  eventSlug: string,
  proposalId: string,
  uid: string,
  data: ProposalRatingData
) {
  await checkUserRole(orgaSlug, eventSlug, uid);

  await db.rating.upsert({
    where: { userId_proposalId: { userId: uid, proposalId } },
    update: data,
    create: { userId: uid, proposalId, ...data },
  });
}
