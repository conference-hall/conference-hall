import { UserEvent } from '../organizer-event/UserEvent';
import { Pagination } from '../shared/Pagination';
import { EventProposalsSearch } from './EventProposalsSearch';
import type { ProposalsFilters } from './EventProposalsSearch.types';
import { ReviewsDetails } from './ReviewDetails';

export class CfpReviewsSearch {
  constructor(
    private userId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new CfpReviewsSearch(userId, userEvent);
  }

  async search(filters: ProposalsFilters, page: number = 1) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER', 'REVIEWER']);

    const search = new EventProposalsSearch(event.slug, this.userId, filters, {
      withSpeakers: event.displayProposalsSpeakers,
    });

    const statistics = await search.statistics();

    const pagination = new Pagination({ page, total: statistics.total });

    const proposals = await search.proposalsByPage(pagination);

    return {
      filters,
      statistics,
      pagination: { current: pagination.page, total: pagination.pageCount },
      results: proposals.map((proposal) => {
        const reviews = new ReviewsDetails(proposal.reviews);

        return {
          id: proposal.id,
          title: proposal.title,
          status: proposal.status,
          emailAcceptedStatus: proposal.emailAcceptedStatus,
          emailRejectedStatus: proposal.emailRejectedStatus,
          speakers: event.displayProposalsSpeakers ? proposal.speakers.map(({ name }) => name) : [],
          reviews: {
            summary: event.displayProposalsReviews ? reviews.summary() : undefined,
            you: reviews.ofUser(this.userId),
          },
        };
      }),
    };
  }
}
