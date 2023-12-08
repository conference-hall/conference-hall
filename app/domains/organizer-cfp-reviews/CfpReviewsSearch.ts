import { z } from 'zod';

import { db } from '~/libs/db';

import { UserEvent } from '../organizer-event-settings/UserEvent';
import { Pagination } from '../shared/Pagination';
import { ProposalSearchBuilder } from '../shared/ProposalSearchBuilder';
import type { ProposalsFilters } from '../shared/ProposalSearchBuilder.types';
import type { SocialLinks } from '../speaker-profile/SpeakerProfile.types';
import { ReviewDetails } from './ReviewDetails';

export const ProposalsStatusUpdateSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
  selection: z.array(z.string()),
});

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

    const search = new ProposalSearchBuilder(event.slug, this.userId, filters, {
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
        const reviews = new ReviewDetails(proposal.reviews);

        return {
          id: proposal.id,
          title: proposal.title,
          deliberationStatus: proposal.deliberationStatus,
          speakers: event.displayProposalsSpeakers
            ? proposal.speakers.map(({ name, picture }) => ({ name, picture }))
            : [],
          reviews: {
            summary: event.displayProposalsReviews ? reviews.summary() : undefined,
            you: reviews.ofUser(this.userId),
          },
        };
      }),
    };
  }

  async changeStatus(proposalIds: string[], deliberationStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED') {
    await this.userEvent.allowedFor(['OWNER', 'MEMBER']);

    const result = await db.proposal.updateMany({
      where: { id: { in: proposalIds }, deliberationStatus: { not: deliberationStatus } },
      data: {
        deliberationStatus,
        publicationStatus: 'NOT_PUBLISHED',
        confirmationStatus: deliberationStatus === 'PENDING' ? 'PENDING' : undefined,
      },
    });
    return result.count;
  }

  async forJsonExport(filters: ProposalsFilters) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);

    const search = new ProposalSearchBuilder(event.slug, this.userId, filters, {
      withSpeakers: event.displayProposalsSpeakers,
    });

    const proposals = await search.proposals({ reviews: event.displayProposalsReviews });

    return proposals.map((proposal) => {
      const reviews = new ReviewDetails(proposal.reviews);
      return {
        id: proposal.id,
        title: proposal.title,
        abstract: proposal.abstract,
        deliberationStatus: proposal.deliberationStatus,
        level: proposal.level,
        comments: proposal.comments,
        references: proposal.references,
        formats: proposal.formats,
        categories: proposal.categories,
        languages: proposal.languages,
        speakers: event.displayProposalsSpeakers
          ? proposal.speakers.map((speaker) => ({
              name: speaker.name,
              bio: speaker.bio,
              company: speaker.company,
              references: speaker.references,
              picture: speaker.picture,
              address: speaker.address,
              email: speaker.email,
              socials: speaker.socials as SocialLinks,
            }))
          : undefined,
        reviews: event.displayProposalsReviews ? reviews.summary() : undefined,
      };
    });
  }

  async forCardsExport(filters: ProposalsFilters) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER']);

    const search = new ProposalSearchBuilder(event.slug, this.userId, filters, {
      withSpeakers: event.displayProposalsSpeakers,
    });

    const proposals = await search.proposals({ reviews: event.displayProposalsReviews });

    return proposals.map((proposal) => {
      const reviews = new ReviewDetails(proposal.reviews);

      return {
        id: proposal.id,
        title: proposal.title,
        level: proposal.level,
        formats: proposal.formats,
        categories: proposal.categories,
        languages: proposal.languages as string[],
        speakers: event.displayProposalsSpeakers ? proposal.speakers.map((speaker) => speaker.name) : undefined,
        reviews: event.displayProposalsReviews ? reviews.summary() : undefined,
      };
    });
  }
}
