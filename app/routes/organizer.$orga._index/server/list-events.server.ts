import { db } from '~/libs/db';
import { getUserRole } from '~/shared-server/organizations/get-user-role.server';
import { getCfpState } from '~/utils/event';

export async function listEvents(slug: string, userId: string, archived: boolean) {
  const role = await getUserRole(slug, userId);
  if (!role) return [];

  const events = await db.event.findMany({
    where: { organization: { slug }, archived },
    orderBy: { name: 'asc' },
  });

  return events.map((event) => ({
    slug: event.slug,
    name: event.name,
    type: event.type,
    bannerUrl: event.bannerUrl,
    cfpStart: event.cfpStart?.toUTCString(),
    cfpEnd: event.cfpEnd?.toUTCString(),
    cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
  }));
}
