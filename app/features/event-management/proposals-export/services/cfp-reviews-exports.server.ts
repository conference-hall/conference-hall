import { ReviewDetails } from '~/features/event-management/proposals/models/review-details.ts';
import type { ProposalsFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { ProposalSearchBuilder } from '~/features/event-management/proposals/services/proposal-search-builder.server.ts';
import type { Languages } from '~/shared/types/proposals.types.ts';
import type { SocialLinks } from '~/shared/types/speaker.types.ts';
import { EventAuthorization } from '~/shared/user/event-authorization.server.ts';
import { exportToOpenPlanner } from './jobs/export-to-open-planner.job.ts';

export class CfpReviewsExports extends EventAuthorization {
  static for(userId: string, team: string, event: string) {
    return new CfpReviewsExports(userId, team, event);
  }

  async forJson(filters: ProposalsFilters) {
    const { event } = await this.checkAuthorizedEvent('canExportEventProposals');

    const search = new ProposalSearchBuilder(event.slug, this.userId, filters, {
      withSpeakers: true,
      withReviews: true,
    });

    const proposals = await search.proposals({ reviews: true });

    return proposals.map((proposal) => {
      const reviews = new ReviewDetails(proposal.reviews);

      return {
        id: proposal.id,
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
    const { event } = await this.checkAuthorizedEvent('canExportEventProposals');

    const search = new ProposalSearchBuilder(event.slug, this.userId, filters, {
      withSpeakers: true,
      withReviews: true,
    });

    const proposals = await search.proposals({ reviews: true });

    return proposals.map((proposal) => {
      const reviews = new ReviewDetails(proposal.reviews);

      return {
        id: proposal.id,
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
    await this.checkAuthorizedEvent('canExportEventProposals');

    await exportToOpenPlanner.trigger({ userId: this.userId, teamSlug: this.team, eventSlug: this.event, filters });
  }
}
