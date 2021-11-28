import z from 'zod'
import { EventVisibility } from '@prisma/client';
import { db } from './db.server';

export interface ISearchResult {
  terms?: string;
  results: IEventResult[];
}

interface IEventResult {
  id: string;
  name: string;
  address: string | null;
}

const SearchEventsCriterias = z.object({
  terms: z.string().optional(),
})

export async function searchEvents(request: Request): Promise<ISearchResult> {
  const url = new URL(request.url);

  const criterias = SearchEventsCriterias.safeParse(Object.fromEntries(url.searchParams));
  if (!criterias.success) {
    throw new Response('Bad search parameters', { status: 400 });
  }
  const { terms } = criterias.data;

  const results = await db.event.findMany({
    select: { id: true, name: true, address: true },
    where: {
      visibility: EventVisibility.PUBLIC,
      name: { contains: terms, mode: 'insensitive' },
      cfpStart: { not: null },
    },
    orderBy: { cfpStart: 'desc' },
  });

  return { terms, results };
}
