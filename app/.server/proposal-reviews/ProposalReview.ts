import { db } from 'prisma/db.server';
import { ForbiddenOperationError, ProposalNotFoundError, ReviewDisabledError, UserNotFoundError } from '~/libs/errors.server';

import type { SurveyData } from '../cfp-survey/SpeakerAnswers.types';
import { UserEvent } from '../organizer-event-settings/UserEvent';
import { ProposalSearchBuilder } from '../shared/ProposalSearchBuilder';
import type { ProposalsFilters } from '../shared/ProposalSearchBuilder.types';
import type { SocialLinks } from '../speaker-profile/SpeakerProfile.types';
import type { ProposalUpdateData, ReviewUpdateData } from './ProposalReview.types';
import { ReviewDetails } from './ReviewDetails';

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
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER', 'REVIEWER']);

    const proposal = await db.proposal.findFirst({
      include: {
        speakers: event.displayProposalsSpeakers,
        formats: true,
        categories: true,
        reviews: true,
      },
      where: { id: this.proposalId },
    });
    if (!proposal) throw new ProposalNotFoundError();

    const reviews = new ReviewDetails(proposal.reviews);

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
        })) || [],
    };
  }

  async getPreviousAndNextReviews(filters: ProposalsFilters) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER', 'REVIEWER']);

    const search = new ProposalSearchBuilder(event.slug, this.userId, filters);

    const { total, reviewed } = await search.statistics();
    const proposalIds = await search.proposalsIds();

    const curIndex = proposalIds.findIndex((id) => id === this.proposalId);
    const previousId = curIndex - 1 >= 0 ? proposalIds.at(curIndex - 1) : undefined;
    const nextId = curIndex + 1 < total ? proposalIds.at(curIndex + 1) : undefined;

    return { total, reviewed, current: curIndex + 1, previousId, nextId };
  }

  async addReview(data: ReviewUpdateData) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER', 'REVIEWER']);
    if (!event.reviewEnabled) throw new ReviewDisabledError();

    await db.$transaction(async (trx) => {
      await db.review.upsert({
        where: { userId_proposalId: { userId: this.userId, proposalId: this.proposalId } },
        update: data,
        create: { userId: this.userId, proposalId: this.proposalId, ...data },
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
    await this.userEvent.allowedFor(['OWNER', 'MEMBER']);

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

  async getSpeakerInfo(speakerId: string) {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER', 'REVIEWER']);
    if (!event.displayProposalsSpeakers) throw new ForbiddenOperationError();

    const speaker = await db.user.findUnique({
      where: { id: speakerId, proposals: { some: { id: this.proposalId } } },
    });
    if (!speaker) throw new UserNotFoundError();

    const survey = await db.survey.findFirst({ where: { eventId: event.id, userId: speakerId } });

    return {
      id: speaker.id,
      name: speaker.name,
      picture: speaker.picture,
      bio: speaker.bio,
      references: speaker.references,
      email: speaker.email,
      company: speaker.company,
      address: speaker.address,
      socials: speaker.socials as SocialLinks,
      survey: survey?.answers as SurveyData | undefined,
    };
  }
}
