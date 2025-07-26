import { parseWithZod } from '@conform-to/zod/v4';
import { db } from 'prisma/db.server.ts';
import z from 'zod';
import { Pagination } from '~/shared/pagination/pagination.ts';
import { UserEventAuthorization } from '~/shared/user/user-event-authorization.server.ts';
import { ProposalSearchBuilder } from '../../proposals/services/proposal-search-builder.server.ts';

const AutocompleteFilterSchema = z.object({ query: z.string().optional(), type: z.array(z.string()) });

type AutocompleteFilters = z.infer<typeof AutocompleteFilterSchema>;
type AutocompleteResult = { section: string; id: string; title: string; description: string | null };

const pagination = new Pagination({ page: 1, pageSize: 3, total: 3 });

export class Autocomplete extends UserEventAuthorization {
  static for(userId: string, team: string, event: string) {
    return new Autocomplete(userId, team, event);
  }

  async search(filters: AutocompleteFilters) {
    const event = await this.needsPermission('canAccessEvent');

    const { query, type } = filters;
    if (!query) return [];

    const [proposals, speakers] = await Promise.all([
      type.includes('proposals') ? this.#searchProposals(event.slug, query) : [],
      type.includes('speakers') ? this.#searchSpeakers(event.id, query) : [],
    ]);

    return [...proposals, ...speakers];
  }

  async #searchProposals(eventSlug: string, query: string): Promise<AutocompleteResult[]> {
    const search = new ProposalSearchBuilder(
      eventSlug,
      this.userId,
      { query },
      { withSpeakers: true, withReviews: false },
    );

    const proposals = await search.proposalsByPage(pagination);

    return proposals.map((proposal) => {
      return {
        section: 'proposals',
        id: proposal.id,
        title: proposal.title,
        description: proposal.speakers.map(({ name }) => name).join(', '),
      };
    });
  }

  async #searchSpeakers(eventId: string, query: string): Promise<AutocompleteResult[]> {
    const speakers = await db.eventSpeaker.findMany({
      where: { eventId, name: { contains: query, mode: 'insensitive' } },
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
    });

    return speakers.map((speaker) => {
      return {
        section: 'speakers',
        id: speaker.id,
        title: speaker.name,
        description: speaker.company,
      };
    });
  }
}

export function parseUrlFilters(url: string) {
  const params = new URL(url).searchParams;
  const result = parseWithZod(params, { schema: AutocompleteFilterSchema });
  if (result.status !== 'success') return { type: [] };
  return result.value;
}
