import { EventVisibility } from '@prisma/client';
import { CfpState, getCfpState } from '~/utils/event';
import { db } from '../../services/db';

export type SearchEvents = {
  terms?: string;
  results: Array<{
    slug: string;
    name: string;
    type: 'CONFERENCE' | 'MEETUP';
    address: string | null;
    cfpState: CfpState;
  }>;
};

export async function searchEvents(terms?: string): Promise<SearchEvents> {
  const events = await db.event.findMany({
    select: { slug: true, name: true, type: true, address: true, cfpStart: true, cfpEnd: true },
    where: {
      visibility: EventVisibility.PUBLIC,
      name: { contains: terms, mode: 'insensitive' },
      cfpStart: { not: null },
    },
    orderBy: { cfpStart: 'desc' },
  });

  return {
    terms,
    results: events.map((event) => ({
      slug: event.slug,
      name: event.name,
      type: event.type,
      address: event.address,
      cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
    })),
  };
}
