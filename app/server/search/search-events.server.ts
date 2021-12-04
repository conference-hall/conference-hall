import { DataFunctionArgs } from '@remix-run/server-runtime';
import { EventVisibility } from '@prisma/client';
import { CfpState, getCfpState } from '~/utils/event';
import { db } from '../db';

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

export async function searchEvents({ request }: DataFunctionArgs): Promise<SearchEvents> {
  const url = new URL(request.url);
  const terms = url.searchParams.get('terms') ?? undefined;

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
