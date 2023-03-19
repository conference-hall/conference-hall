import { db } from '../../../libs/db';
import { checkUserRole } from '../../../shared/organizations/check-user-role.server';

export async function getAcceptationCampaignStats(orgaSlug: string, eventSlug: string, uid: string) {
  await checkUserRole(orgaSlug, eventSlug, uid, ['OWNER', 'MEMBER']);

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
