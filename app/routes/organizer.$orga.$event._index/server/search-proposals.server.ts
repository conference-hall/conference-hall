import type { Pagination } from '~/schemas/pagination';
import type { ProposalsFilters } from '~/schemas/proposal';
import { checkUserRole } from '~/shared-server/organizations/check-user-role.server';
import { getPagination } from '~/shared-server/pagination/pagination.server';
import { OrganizerProposalsSearch } from '~/shared-server/proposals/OrganizerProposalsSearch';
import { RatingsDetails } from '~/shared-server/ratings/ratings-details';

const RESULTS_BY_PAGE = 25;

export async function searchProposals(
  orgaSlug: string,
  eventSlug: string,
  userId: string,
  filters: ProposalsFilters,
  page: Pagination = 1
) {
  await checkUserRole(orgaSlug, eventSlug, userId);

  const search = new OrganizerProposalsSearch(eventSlug, userId, filters);

  const statistics = await search.statistics();

  const { pageIndex, currentPage, totalPages } = getPagination(page, statistics.total, RESULTS_BY_PAGE);

  const proposals = await search.proposalsByPage(pageIndex);

  return {
    filters,
    statistics,
    pagination: { current: currentPage, total: totalPages },
    results: proposals.map((proposal) => {
      const ratings = new RatingsDetails(proposal.ratings);

      return {
        id: proposal.id,
        title: proposal.title,
        status: proposal.status,
        emailAcceptedStatus: proposal.emailAcceptedStatus,
        emailRejectedStatus: proposal.emailRejectedStatus,
        speakers: proposal.speakers.map(({ name }) => name),
        ratings: {
          positives: ratings.positives,
          negatives: ratings.negatives,
          you: ratings.fromUser(userId)?.rating ?? null,
          total: ratings.average,
        },
      };
    }),
  };
}
