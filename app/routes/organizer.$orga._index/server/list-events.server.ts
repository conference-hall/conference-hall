import { db } from '~/libs/db';
import { allowedForOrga } from '~/shared-server/organizations/check-user-role.server';
import { getCfpState } from '~/utils/event';

export async function listEvents(slug: string, userId: string, archived: boolean) {
  await allowedForOrga(slug, userId);

  const events = await db.event.findMany({
    where: { organization: { slug }, archived },
    orderBy: { name: 'asc' },
  });

  return events.map((event) => ({
    slug: event.slug,
    name: event.name,
    type: event.type,
    logo: event.logo,
    cfpStart: event.cfpStart?.toUTCString(),
    cfpEnd: event.cfpEnd?.toUTCString(),
    cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
  }));
}
