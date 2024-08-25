import { UserEvent } from '../event-settings/user-event.ts';
import { ProposalSearchBuilder } from '../shared/proposal-search-builder.ts';
import type { ProposalsFilters } from '../shared/proposal-search-builder.types.ts';
import type { SocialLinks } from '../speaker-profile/speaker-profile.types.ts';
import { exportToOpenPlanner } from './jobs/export-to-open-planner.job.ts';
import { ReviewDetails } from './review-details.ts';

export class CfpReviewsExports {
  constructor(
    private userId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new CfpReviewsExports(userId, userEvent);
  }

  async forJson(filters: ProposalsFilters) {
    const event = await this.userEvent.needsPermission('canExportEventProposals');

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
          name: speaker.name,
          bio: speaker.bio,
          company: speaker.company,
          references: speaker.references,
          picture: speaker.picture,
          location: speaker.location,
          email: speaker.email,
          socials: speaker.socials as SocialLinks,
        })),
        reviews: reviews.summary(),
      };
    });
  }

  async forCards(filters: ProposalsFilters) {
    const event = await this.userEvent.needsPermission('canExportEventProposals');

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
        languages: proposal.languages as string[],
        speakers: proposal.speakers.map((speaker) => speaker.name),
        reviews: reviews.summary(),
      };
    });
  }

  async forOpenPlanner(filters: ProposalsFilters) {
    await this.userEvent.needsPermission('canExportEventProposals');

    const { userId, teamSlug, eventSlug } = this.userEvent;
    await exportToOpenPlanner.trigger({ userId, teamSlug, eventSlug, filters });
  }
}
