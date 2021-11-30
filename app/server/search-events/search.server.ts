import z from 'zod';
import { CfpState, getCfpState } from '../common/cfp-dates';
import * as services from './search.service';

const SearchEventsCriterias = z.object({
  terms: z.string().optional(),
});

export type SearchEventsResponse = {
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

export async function searchEvents(request: Request): Promise<SearchEventsResponse> {
  const url = new URL(request.url);
  const criterias = SearchEventsCriterias.safeParse(Object.fromEntries(url.searchParams));
  if (!criterias.success) {
    throw new Response('Bad search parameters', { status: 400 });
  }

  const { terms } = criterias.data;
  const data = await services.searchEvents({ terms });

  return {
    terms,
    results: data.events.map((event) => ({
      id: event.id,
      name: event.name,
      type: event.type,
      address: event.address,
      cfpStart: event.cfpStart?.toUTCString(),
      cfpEnd: event.cfpEnd?.toUTCString(),
      cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
    })),
  };
}
