import { db } from '~/libs/db.ts';

export async function getAcceptationCampaignStats(eventSlug: string, userId: string) {
  const toSend = await db.proposal.count({
    where: {
      event: { slug: eventSlug },
      status: { in: ['ACCEPTED', 'CONFIRMED', 'DECLINED'] },
      emailAcceptedStatus: null,
    },
  });
  const sentStatusCount = await db.proposal.count({
    where: {
      event: { slug: eventSlug },
      status: { in: ['ACCEPTED', 'CONFIRMED', 'DECLINED'] },
      emailAcceptedStatus: 'SENT',
    },
  });
  const deliveredStatusCount = await db.proposal.count({
    where: {
      event: { slug: eventSlug },
      status: { in: ['ACCEPTED', 'CONFIRMED', 'DECLINED'] },
      emailAcceptedStatus: 'DELIVERED',
    },
  });

  return { toSend, sent: sentStatusCount + deliveredStatusCount, delivered: deliveredStatusCount };
}
