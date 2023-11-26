import { db } from '~/libs/db.ts';

export async function getRejectionCampaignStats(eventSlug: string, userId: string) {
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
