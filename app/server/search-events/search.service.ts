import { EventVisibility } from '@prisma/client';
import { db } from '../db';

type SearchEventsArgs = { terms?: string };

export async function searchEvents({ terms }: SearchEventsArgs) {
  const events = await db.event.findMany({
    select: { id: true, name: true, type: true, address: true, cfpStart: true, cfpEnd: true },
    where: {
      visibility: EventVisibility.PUBLIC,
      name: { contains: terms, mode: 'insensitive' },
      cfpStart: { not: null },
    },
    orderBy: { cfpStart: 'desc' },
  });

  return { terms, events };
}
