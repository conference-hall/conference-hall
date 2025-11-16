import { db, EventType, EventVisibility } from '@conference-hall/database';

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
