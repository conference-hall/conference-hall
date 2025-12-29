import { ReviewDetails } from '~/features/event-management/proposals/models/review-details.ts';
import type { ProposalsFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { ProposalSearchBuilder } from '~/features/event-management/proposals/services/proposal-search-builder.server.ts';
import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import type { Languages } from '~/shared/types/proposals.types.ts';
import type { SocialLinks } from '~/shared/types/speaker.types.ts';
import { exportToOpenPlanner } from './jobs/export-to-open-planner.job.ts';

export class CfpReviewsExports {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new CfpReviewsExports(authorizedEvent);
  }

  async forJson(filters: ProposalsFilters) {
    const { event, userId, permissions } = this.authorizedEvent;
    if (!permissions.canExportEventProposals) throw new ForbiddenOperationError();

    const search = new ProposalSearchBuilder(event.id, userId, filters, { withSpeakers: true, withReviews: true });

    const proposals = await search.proposals({ reviews: true });

    return proposals.map((proposal) => {
      const reviews = new ReviewDetails(proposal.reviews);

      return {
        id: proposal.id,
        proposalNumber: proposal.proposalNumber,
        title: proposal.title,
        abstract: proposal.abstract,
        deliberationStatus: proposal.deliberationStatus,
        confirmationStatus: proposal.confirmationStatus,
        publicationStatus: proposal.publicationStatus,
        level: proposal.level,
        references: proposal.references,
        formats: proposal.formats.map((format) => ({
          id: format.id,
          name: format.name,
          description: format.description,
        })),
        categories: proposal.categories.map((category) => ({
          id: category.id,
          name: category.name,
          description: category.description,
        })),
        tags: proposal.tags.map((tag) => tag.name),
        languages: proposal.languages,
        speakers: proposal.speakers.map((speaker) => ({
          id: speaker.id,
          name: speaker.name,
          bio: speaker.bio,
          company: speaker.company,
          references: speaker.references,
          picture: speaker.picture,
          location: speaker.location,
          email: speaker.email,
          socialLinks: speaker.socialLinks as SocialLinks,
        })),
        review: reviews.summary(),
      };
    });
  }

  async forCards(filters: ProposalsFilters) {
    const { event, userId, permissions } = this.authorizedEvent;
    if (!permissions.canExportEventProposals) throw new ForbiddenOperationError();

    const search = new ProposalSearchBuilder(event.id, userId, filters, { withSpeakers: true, withReviews: true });

    const proposals = await search.proposals({ reviews: true });

    return proposals.map((proposal) => {
      const reviews = new ReviewDetails(proposal.reviews);

      return {
        id: proposal.id,
        proposalNumber: proposal.proposalNumber,
        title: proposal.title,
        level: proposal.level,
        formats: proposal.formats,
        categories: proposal.categories,
        languages: proposal.languages as Languages,
        speakers: proposal.speakers.map((speaker) => speaker.name),
        reviews: reviews.summary(),
      };
    });
  }

  async forOpenPlanner(filters: ProposalsFilters) {
    const { permissions } = this.authorizedEvent;
    if (!permissions.canExportEventProposals) throw new ForbiddenOperationError();

    await exportToOpenPlanner.trigger({ authorizedEvent: this.authorizedEvent, filters });
  }
}
