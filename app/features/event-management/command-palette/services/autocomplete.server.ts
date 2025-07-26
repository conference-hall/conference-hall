import { parseWithZod } from '@conform-to/zod/v4';
import z from 'zod';
import { Pagination } from '~/shared/pagination/pagination.ts';
import { UserEventAuthorization } from '~/shared/user/user-event-authorization.server.ts';
import { ProposalSearchBuilder } from '../../proposals/services/proposal-search-builder.server.ts';

const AutocompleteFilterSchema = z.object({ query: z.string().optional() });

export type AutocompleteFilter = z.infer<typeof AutocompleteFilterSchema>;

export class Autocomplete extends UserEventAuthorization {
  static for(userId: string, team: string, event: string) {
    return new Autocomplete(userId, team, event);
  }

  async searchProposals(filters: AutocompleteFilter) {
    const event = await this.needsPermission('canAccessEvent');

    const { query } = filters;
    if (!query) return [];

    const search = new ProposalSearchBuilder(
      event.slug,
      this.userId,
      { query },
      { withSpeakers: true, withReviews: false },
    );

    const pagination = new Pagination({ page: 1, pageSize: 3, total: 10 }); // todo(autocomplete) total is optional here ?
    const proposals = await search.proposalsByPage(pagination);

    return proposals.map((proposal) => {
      return {
        id: proposal.id,
        title: proposal.title,
        speakers: proposal.speakers.map(({ name }) => name),
      };
    });
  }
}

export function parseUrlFilters(url: string) {
  const params = new URL(url).searchParams;
  const result = parseWithZod(params, { schema: AutocompleteFilterSchema });
  if (result.status !== 'success') return {};
  return result.value;
}
