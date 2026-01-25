import { parseWithZod } from '@conform-to/zod/v4';
import { z } from 'zod';
import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { Pagination } from '~/shared/pagination/pagination.ts';
import { sortBy } from '~/shared/utils/arrays-sort-by.ts';
import type { Event } from '../../../../../prisma/generated/client.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { ProposalSearchBuilder } from '../../proposals/services/proposal-search-builder.server.ts';

const AutocompleteFilterSchema = z.object({ query: z.string().optional(), kind: z.array(z.string()) });

type AutocompleteFilters = z.infer<typeof AutocompleteFilterSchema>;

// todo(autocomplete): migrate other proposal autocomplete to use this one
type AutocompleteResult = {
  kind: string;
  id: string;
  label: string;
  description: string | null;
  picture?: string | null;
};

const pagination = new Pagination({ page: 1, pageSize: 3, total: 3 });

export class Autocomplete {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new Autocomplete(authorizedEvent);
  }

  async search(filters: AutocompleteFilters) {
    const { event } = this.authorizedEvent;

    const { query, kind } = filters;
    if (!query) return [];

    const [proposals, speakers, speakersForProposal] = await Promise.all([
      kind.includes('proposals') ? this.#searchProposals(event, query) : [],
      kind.includes('speakers') ? this.#searchSpeakers(event, query, false) : [],
      kind.includes('speakers-for-proposal') ? this.#searchSpeakers(event, query, true) : [],
    ]);

    return [...proposals, ...speakers, ...speakersForProposal];
  }

  async #searchProposals(event: Event, query: string): Promise<AutocompleteResult[]> {
    const search = new ProposalSearchBuilder(
      this.authorizedEvent.event.id,
      this.authorizedEvent.userId,
      { query },
      { withSpeakers: event.displayProposalsSpeakers, withReviews: false },
    );

    const proposals = await search.proposalsByPage(pagination);

    return proposals.map((proposal) => {
      return {
        kind: 'proposals',
        id: proposal.routeId,
        label: proposal.title,
        description:
          sortBy(proposal.speakers, 'name')
            ?.map(({ name }) => name)
            .join(', ') || '',
      };
    });
  }

  async #searchSpeakers(event: Event, query: string, skipPermission: boolean): Promise<AutocompleteResult[]> {
    if (!skipPermission && !event.displayProposalsSpeakers) return [];

    const speakers = await db.eventSpeaker.findMany({
      where: {
        eventId: event.id,
        OR: [{ name: { contains: query, mode: 'insensitive' } }, { email: { equals: query, mode: 'insensitive' } }],
      },
      orderBy: { name: 'asc' },
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
    });

    return speakers.map((speaker) => {
      return {
        kind: 'speakers',
        id: speaker.id,
        label: speaker.name,
        description: speaker.company,
        picture: speaker.picture,
      };
    });
  }
}

export function parseUrlFilters(url: string) {
  const params = new URL(url).searchParams;
  const result = parseWithZod(params, { schema: AutocompleteFilterSchema });
  if (result.status !== 'success') return { kind: [] };
  return result.value;
}
