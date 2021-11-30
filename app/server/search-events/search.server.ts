import z from 'zod'
import * as services from './search.service';

const SearchEventsCriterias = z.object({
  terms: z.string().optional(),
})

export type SearchResult = {
  terms?: string;
  results: Array<{
    id: string;
    name: string;
    address: string | null;
  }>;
}

export async function searchEvents(request: Request): Promise<SearchResult> {
  const url = new URL(request.url);

  const criterias = SearchEventsCriterias.safeParse(Object.fromEntries(url.searchParams));
  if (!criterias.success) {
    throw new Response('Bad search parameters', { status: 400 });
  }
  const { terms } = criterias.data;

  return services.searchEvents({ terms });
}
