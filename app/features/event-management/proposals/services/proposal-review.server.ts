import { db } from 'prisma/db.server.ts';
import { SpeakerSurvey } from '~/features/event-participation/speaker-survey/services/speaker-survey.server.ts';
import { ProposalNotFoundError, ReviewDisabledError } from '~/shared/errors.server.ts';
import type { Languages } from '~/shared/types/proposals.types.ts';
import type { SocialLinks } from '~/shared/types/speaker.types.ts';
import type { SurveyDetailedAnswer } from '~/shared/types/survey.types.ts';
import { EventAuthorization } from '~/shared/user/event-authorization.server.ts';
import { sortBy } from '~/shared/utils/arrays-sort-by.ts';
import { ReviewDetails } from '../models/review-details.ts';
import type { ReviewUpdateData } from './proposal-review.schema.server.ts';
import type { ProposalsFilters } from './proposal-search-builder.schema.server.ts';
import { ProposalSearchBuilder } from './proposal-search-builder.server.ts';

export type ProposalReviewData = Awaited<ReturnType<typeof ProposalReview.prototype.get>>;

export class ProposalReview extends EventAuthorization {
  private proposalId: string;

  constructor(userId: string, team: string, event: string, proposalId: string) {
    super(userId, team, event);
    this.proposalId = proposalId;
  }

  static for(userId: string, team: string, event: string, proposalId: string) {
    return new ProposalReview(userId, team, event, proposalId);
  }

  async get() {
    const { event } = await this.checkAuthorizedEvent('canAccessEvent');

    const proposal = await db.proposal.findFirst({
      include: {
        speakers: event.displayProposalsSpeakers,
        formats: true,
        categories: true,
        reviews: true,
        tags: true,
      },
      where: { id: this.proposalId },
    });
    if (!proposal) throw new ProposalNotFoundError();

    const reviews = new ReviewDetails(proposal.reviews);

    let answers: Record<string, Array<SurveyDetailedAnswer>> = {};
    if (proposal.speakers) {
      const survey = SpeakerSurvey.for(event.slug);
      const userIds = proposal.speakers.map((s) => s.userId).filter((id) => id !== null);
      answers = await survey.getMultipleSpeakerAnswers(event, userIds);
    }

    return {
      id: proposal.id,
      title: proposal.title,
      abstract: proposal.abstract,
      references: proposal.references,
      level: proposal.level,
      deliberationStatus: proposal.deliberationStatus,
      publicationStatus: proposal.publicationStatus,
      confirmationStatus: proposal.confirmationStatus,
      createdAt: proposal.createdAt,
      languages: proposal.languages as Languages,
      formats: proposal.formats.map(({ id, name }) => ({ id, name })),
      categories: proposal.categories.map(({ id, name }) => ({ id, name })),
      reviews: {
        you: reviews.ofUser(this.userId),
        summary: event.displayProposalsReviews ? reviews.summary() : null,
      },
      speakers:
        proposal.speakers?.map((speaker) => ({
          id: speaker.id,
          userId: speaker.userId,
          name: speaker.name,
          picture: speaker.picture,
          company: speaker.company,
          bio: speaker.bio,
          references: speaker.references,
          email: speaker.email,
          location: speaker.location,
          socialLinks: speaker.socialLinks as SocialLinks,
          survey: speaker.userId ? answers[speaker.userId] : [],
        })) || [],
      tags: sortBy(
        proposal.tags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color })),
        'name',
      ),
    };
  }

  async getOtherProposals(speakerIds: Array<string>) {
    const { event } = await this.checkAuthorizedEvent('canAccessEvent');

    if (!event.displayProposalsSpeakers) return [];

    const proposals = await db.proposal.findMany({
      include: { reviews: true, speakers: true },
      where: {
        id: { not: this.proposalId },
        speakers: { some: { id: { in: speakerIds } } },
        eventId: event.id,
        isDraft: false,
      },
    });

    return proposals.map((proposal) => {
      const reviews = new ReviewDetails(proposal.reviews);
      return {
        id: proposal.id,
        title: proposal.title,
        review: event.displayProposalsReviews ? reviews.summary().average : null,
        speakers: proposal.speakers.map((speaker) => speaker.name),
      };
    });
  }

  async getPreviousAndNextReviews(filters: ProposalsFilters) {
    const { event } = await this.checkAuthorizedEvent('canAccessEvent');

    const search = new ProposalSearchBuilder(event.slug, this.userId, filters);

    const { total, reviewed } = await search.statistics();
    const proposalIds = await search.proposalsIds();

    const curIndex = proposalIds.indexOf(this.proposalId);
    const previousId = curIndex - 1 >= 0 ? proposalIds.at(curIndex - 1) : undefined;
    const nextId = curIndex + 1 < total ? proposalIds.at(curIndex + 1) : undefined;

    return { total, reviewed, current: curIndex + 1, previousId, nextId };
  }

  async addReview(data: ReviewUpdateData) {
    const { event } = await this.checkAuthorizedEvent('canAccessEvent');
    if (!event.reviewEnabled) throw new ReviewDisabledError();

    await db.review.upsert({
      where: { userId_proposalId: { userId: this.userId, proposalId: this.proposalId } },
      create: { userId: this.userId, proposalId: this.proposalId, ...data },
      update: data,
    });

    const reviews = await db.review.findMany({
      where: { proposalId: this.proposalId, feeling: { not: 'NO_OPINION' } },
    });

    const reviewsDetails = new ReviewDetails(reviews);
    const average = reviewsDetails.summary().average ?? null;
    await db.proposal.update({ where: { id: this.proposalId }, data: { avgRateForSort: average } });
  }
}
