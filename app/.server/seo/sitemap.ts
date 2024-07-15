import { EventVisibility } from '@prisma/client';
import { db } from 'prisma/db.server.ts';

export async function getEventsForSitemap() {
  const events = await db.event.findMany({
    where: {
      visibility: EventVisibility.PUBLIC,
      archived: false,
      cfpStart: { lt: new Date() },
      OR: [{ cfpEnd: null }, { cfpEnd: { gt: new Date() } }],
    },
    orderBy: [{ name: 'asc' }],
  });

  return events.map((event) => ({ name: event.name, slug: event.slug, logo: event.logo }));
}
