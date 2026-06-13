import { parseWithZod } from '@conform-to/zod/v4';
import { z } from 'zod';
import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { Pagination } from '~/shared/pagination/pagination.ts';
import { sortBy } from '~/shared/utils/arrays-sort-by.ts';
import { db } from '../../../../../prisma/db.server.ts';
import type { Event } from '../../../../../prisma/generated/client.ts';
import { ProposalSearchBuilder } from '../../proposals/services/proposal-search-builder.server.ts';

const AutocompleteKindSchema = z.enum(['proposals', 'speakers']);

const AutocompleteFilterSchema = z.object({
  query: z.string().optional(),
  kind: z.array(AutocompleteKindSchema),
});

type AutocompleteFilters = z.infer<typeof AutocompleteFilterSchema>;

export type ProposalResult = {
  kind: 'proposals';
  id: string; // real proposal id (used by the schedule to persist proposalId)
  routeId: string; // URL slug (used for navigation / "see proposal" link)
  title: string;
  speakers: Array<{ name: string | null; picture: string | null }>;
};

export type SpeakerResult = {
  kind: 'speakers';
  id: string; // real speaker id (used for navigation)
  name: string | null;
  company: string | null;
  picture: string | null;
};

export type AutocompleteResult = ProposalResult | SpeakerResult;

const pagination = new Pagination({ page: 1, pageSize: 3, total: 3 });

export class Autocomplete {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new Autocomplete(authorizedEvent);
  }

  async search(filters: AutocompleteFilters): Promise<AutocompleteResult[]> {
    const { event } = this.authorizedEvent;

    const { query, kind } = filters;
    if (!query) return [];

    const [proposals, speakers] = await Promise.all([
      kind.includes('proposals') ? this.#searchProposals(event, query) : [],
      kind.includes('speakers') ? this.#searchSpeakers(event, query) : [],
    ]);

    return [...proposals, ...speakers];
  }

  async #searchProposals(event: Event, query: string): Promise<ProposalResult[]> {
    const search = new ProposalSearchBuilder(
      this.authorizedEvent.event.id,
      this.authorizedEvent.userId,
      { query },
      // Proposal-result speakers stay gated by displayProposalsSpeakers (no permission bypass).
      { withSpeakers: event.displayProposalsSpeakers, withReviews: false },
    );

    const proposals = await search.proposalsByPage(pagination);

    return proposals.map((proposal) => ({
      kind: 'proposals',
      id: proposal.id,
      routeId: proposal.routeId,
      title: proposal.title,
      speakers: sortBy(proposal.speakers, 'name').map(({ name, picture }) => ({ name, picture })),
    }));
  }

  async #searchSpeakers(event: Event, query: string): Promise<SpeakerResult[]> {
    // Blind-review bypass is decided server-side: edit-capable callers always see speakers.
    const canEditProposal = this.authorizedEvent.permissions.canEditEventProposal;
    if (!canEditProposal && !event.displayProposalsSpeakers) return [];

    const speakers = await db.eventSpeaker.findMany({
      where: {
        eventId: event.id,
        OR: [{ name: { contains: query, mode: 'insensitive' } }, { email: { equals: query, mode: 'insensitive' } }],
      },
      orderBy: { name: 'asc' },
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
    });

    return speakers.map((speaker) => ({
      kind: 'speakers',
      id: speaker.id,
      name: speaker.name,
      company: speaker.company,
      picture: speaker.picture,
    }));
  }
}

export function parseUrlFilters(url: URL) {
  const params = url.searchParams;
  const result = parseWithZod(params, { schema: AutocompleteFilterSchema });
  if (result.status !== 'success') return { kind: [] };
  return result.value;
}
