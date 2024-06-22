import { db } from 'prisma/db.server.ts';

import { ProposalNotFoundError, ReviewDisabledError } from '~/libs/errors.server.ts';

import { SpeakersAnswers } from '../cfp-survey/SpeakerAnswers.ts';
import type { SurveyData } from '../cfp-survey/SpeakerAnswers.types';
import { UserEvent } from '../event-settings/UserEvent.ts';
import { ProposalSearchBuilder } from '../shared/ProposalSearchBuilder.ts';
import type { ProposalsFilters } from '../shared/ProposalSearchBuilder.types';
import type { SocialLinks } from '../speaker-profile/SpeakerProfile.types';
import type { ProposalUpdateData, ReviewUpdateData } from './ProposalReview.types';
import { ReviewDetails } from './ReviewDetails.ts';

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

    // TODO add tests on answers
    let answers: Array<{ userId: string; answers: SurveyData }>;
    if (proposal.speakers) {
      const surveys = new SpeakersAnswers(
        proposal.speakers.map((s) => s.id),
        event.slug,
      );
      answers = await surveys.getAnswers();
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
          address: speaker.address,
          socials: speaker.socials as SocialLinks,
          survey: answers?.find((a) => a.userId === speaker.id)?.answers as SurveyData,
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
}
