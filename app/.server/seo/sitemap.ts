import { EventType, EventVisibility } from '@prisma/client';
import { subMonths } from 'date-fns';
import { db } from 'prisma/db.server.ts';

export async function getEventsForSitemap() {
  const OPEN_MEETUP = { type: EventType.MEETUP, cfpStart: { not: null } };
  const OPEN_CONFERENCE = { type: EventType.CONFERENCE, cfpEnd: { gte: new Date() } };

  const events = await db.event.findMany({
    where: {
      visibility: EventVisibility.PUBLIC,
      archived: false,
      OR: [OPEN_MEETUP, OPEN_CONFERENCE],
    },
    orderBy: [{ type: 'desc' }, { cfpStart: 'desc' }, { name: 'asc' }],
  });

  return events.map((event) => ({ name: event.name, slug: event.slug, logoUrl: event.logoUrl }));
}
