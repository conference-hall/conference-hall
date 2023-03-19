import { checkUserRole } from '~/shared/organizations/check-user-role.server';
import { db } from '../../libs/db';

export async function getRejectionCampaignStats(orgaSlug: string, eventSlug: string, uid: string) {
  await checkUserRole(orgaSlug, eventSlug, uid, ['OWNER', 'MEMBER']);

  const toSend = await db.proposal.count({
    where: { event: { slug: eventSlug }, status: 'REJECTED', emailRejectedStatus: null },
  });
  const sentStatusCount = await db.proposal.count({
    where: { event: { slug: eventSlug }, status: 'REJECTED', emailRejectedStatus: 'SENT' },
  });
  const deliveredStatusCount = await db.proposal.count({
    where: { event: { slug: eventSlug }, status: 'REJECTED', emailRejectedStatus: 'DELIVERED' },
  });

  return { toSend, sent: sentStatusCount + deliveredStatusCount, delivered: deliveredStatusCount };
}
