import { db } from '../db';
import { checkAccess } from '../organizer-event/check-access.server';

export async function getRejectionCampaignStats(orgaSlug: string, eventSlug: string, uid: string) {
  await checkAccess(orgaSlug, eventSlug, uid, ['OWNER', 'MEMBER']);

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
