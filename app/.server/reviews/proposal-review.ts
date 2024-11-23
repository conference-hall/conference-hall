import { db } from 'prisma/db.server.ts';

import { ProposalNotFoundError, ReviewDisabledError } from '~/libs/errors.server.ts';

import { sortBy } from '~/libs/utils/arrays-sort-by.ts';
import { UserEvent } from '../event-settings/user-event.ts';
import { SpeakerSurvey } from '../event-survey/speaker-survey.ts';
import type { SurveyDetailedAnswer } from '../event-survey/types.ts';
import { ProposalSearchBuilder } from '../shared/proposal-search-builder.ts';
import type { ProposalsFilters } from '../shared/proposal-search-builder.types.ts';
import type { SocialLinks } from '../speaker-profile/speaker-profile.types.ts';
import type { ProposalSaveTagsData, ProposalUpdateData, ReviewUpdateData } from './proposal-review.types.ts';
import { ReviewDetails } from './review-details.ts';

export type ProposalReviewData = Awaited<ReturnType<typeof ProposalReview.prototype.get>>;

export class ProposalReview {
  constructor(
    private userId: string,
    private proposalId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string, proposalId: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new ProposalReview(userId, proposalId, userEvent);
  }

  async get() {
    const event = await this.userEvent.needsPermission('canAccessEvent');

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
      answers = await survey.getMultipleSpeakerAnswers(
        event,
        proposal.speakers.map((s) => s.id),
      );
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
      languages: proposal.languages as string[],
      formats: proposal.formats.map(({ id, name }) => ({ id, name })),
      categories: proposal.categories.map(({ id, name }) => ({ id, name })),
      reviews: {
        you: reviews.ofUser(this.userId),
        summary: event.displayProposalsReviews ? reviews.summary() : null,
      },
      speakers:
        proposal.speakers?.map((speaker) => ({
          id: speaker.id,
          name: speaker.name,
          picture: speaker.picture,
          company: speaker.company,
          bio: speaker.bio,
          references: speaker.references,
          email: speaker.email,
          location: speaker.location,
          socials: speaker.socials as SocialLinks,
          survey: answers[speaker.id],
        })) || [],
      tags: sortBy(
        proposal.tags.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color })),
        'name',
      ),
    };
  }

  async getOtherProposals(speakerIds: Array<string>) {
    const event = await this.userEvent.needsPermission('canAccessEvent');

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
    const event = await this.userEvent.needsPermission('canAccessEvent');

    const search = new ProposalSearchBuilder(event.slug, this.userId, filters);

    const { total, reviewed } = await search.statistics();
    const proposalIds = await search.proposalsIds();

    const curIndex = proposalIds.findIndex((id) => id === this.proposalId);
    const previousId = curIndex - 1 >= 0 ? proposalIds.at(curIndex - 1) : undefined;
    const nextId = curIndex + 1 < total ? proposalIds.at(curIndex + 1) : undefined;

    return { total, reviewed, current: curIndex + 1, previousId, nextId };
  }

  async addReview(data: ReviewUpdateData) {
    const event = await this.userEvent.needsPermission('canAccessEvent');
    if (!event.reviewEnabled) throw new ReviewDisabledError();

    await db.$transaction(async (trx) => {
      await trx.review.upsert({
        where: { userId_proposalId: { userId: this.userId, proposalId: this.proposalId } },
        create: { userId: this.userId, proposalId: this.proposalId, ...data },
        update: data,
      });

      const reviews = await trx.review.findMany({
        where: { proposalId: this.proposalId, feeling: { not: 'NO_OPINION' } },
      });

      const reviewsDetails = new ReviewDetails(reviews);
      const average = reviewsDetails.summary().average ?? null;
      await trx.proposal.update({ where: { id: this.proposalId }, data: { avgRateForSort: average } });
    });
  }

  async update(data: ProposalUpdateData) {
    await this.userEvent.needsPermission('canEditEventProposals');

    const { formats, categories, ...talk } = data;
    return db.proposal.update({
      where: { id: this.proposalId },
      data: {
        ...talk,
        formats: { set: [], connect: formats?.map((id) => ({ id })) },
        categories: { set: [], connect: categories?.map((id) => ({ id })) },
      },
    });
  }

  async saveTags(data: ProposalSaveTagsData) {
    await this.userEvent.needsPermission('canEditEventProposals');

    return db.proposal.update({
      where: { id: this.proposalId },
      data: { tags: { set: [], connect: data.tags?.map((id) => ({ id })) } },
    });
  }
}
