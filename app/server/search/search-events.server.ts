import { DataFunctionArgs } from '@remix-run/server-runtime';
import { EventVisibility } from '@prisma/client';
import z from 'zod';
import { CfpState, getCfpState } from '../common/cfp-dates';
import { db } from '../db';

const SearchEventsCriterias = z.object({
  terms: z.string().optional(),
});

export type SearchEvents = {
  terms?: string;
  results: Array<{
    id: string;
    name: string;
    type: 'CONFERENCE' | 'MEETUP';
    address: string | null;
    cfpStart?: string;
    cfpEnd?: string;
    cfpState: CfpState;
  }>;
};

export async function searchEvents({ request }: DataFunctionArgs): Promise<SearchEvents> {
  const url = new URL(request.url);
  const criterias = SearchEventsCriterias.safeParse(Object.fromEntries(url.searchParams));
  if (!criterias.success) {
    throw new Response('Bad search parameters', { status: 400 });
  }

  const { terms } = criterias.data;
  const events = await db.event.findMany({
    select: { id: true, name: true, type: true, address: true, cfpStart: true, cfpEnd: true },
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
      id: event.id,
      name: event.name,
      type: event.type,
      address: event.address,
      cfpStart: event.cfpStart?.toISOString(),
      cfpEnd: event.cfpEnd?.toISOString(),
      cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
    })),
  };
}
