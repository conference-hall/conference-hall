import { db } from '~/libs/db';
import { ForbiddenOperationError, ProposalNotFoundError, ReviewDisabledError } from '~/libs/errors';
import { sortBy } from '~/libs/utils/arrays-sort-by';

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
        _count: { select: { reviews: true, messages: true } },
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
      comments: proposal.comments,
      level: proposal.level,
      status: proposal.status,
      createdAt: proposal.createdAt.toUTCString(),
      languages: proposal.languages as string[],
      formats: proposal.formats.map(({ id, name }) => ({ id, name })),
      categories: proposal.categories.map(({ id, name }) => ({ id, name })),
      messagesCount: proposal._count.messages,
      reviewsCount: proposal._count.reviews,
      reviews: {
        you: reviews.ofUser(this.userId),
        summary: event.displayProposalsReviews ? reviews.summary() : undefined,
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

    const search = new ProposalSearchBuilder(event.slug, this.userId, filters, {
      withSpeakers: event.displayProposalsSpeakers,
    });
    const proposalIds = await search.proposalsIds();
    const totalProposals = proposalIds.length;
    const curIndex = proposalIds.findIndex((id) => id === this.proposalId);
    const previousId = curIndex - 1 >= 0 ? proposalIds.at(curIndex - 1) : undefined;
    const nextId = curIndex + 1 < totalProposals ? proposalIds.at(curIndex + 1) : undefined;

    return { total: totalProposals, current: curIndex + 1, previousId, nextId };
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
      const average = reviewsDetails.summary().average ?? undefined;
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

  async getSpeakerInfo() {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER', 'REVIEWER']);
    if (!event.displayProposalsSpeakers) throw new ForbiddenOperationError();

    const proposal = await db.proposal.findUnique({ include: { speakers: true }, where: { id: this.proposalId } });
    if (!proposal) throw new ProposalNotFoundError();

    const surveys = await db.survey.findMany({
      where: { eventId: event.id, userId: { in: proposal?.speakers.map(({ id }) => id) } },
    });

    return sortBy(
      proposal.speakers.map((speaker) => {
        const survey = surveys.find((survey) => survey.userId === speaker.id);

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
      }),
      'name',
    );
  }

  async getTeamReviews() {
    const event = await this.userEvent.allowedFor(['OWNER', 'MEMBER', 'REVIEWER']);
    if (!event.displayProposalsReviews) throw new ForbiddenOperationError();

    const result = await db.review.findMany({ where: { proposalId: this.proposalId }, include: { user: true } });
    const reviews = new ReviewDetails(result);
    return reviews.ofMembers();
  }
}