import { db } from 'prisma/db.server.ts';

import { ProposalNotFoundError, ReviewDisabledError } from '~/libs/errors.server.ts';

import { SpeakersAnswers } from '../cfp-survey/speaker-answers.ts';
import type { SurveyData } from '../cfp-survey/speaker-answers.types.ts';
import { UserEvent } from '../event-settings/user-event.ts';
import { ProposalSearchBuilder } from '../shared/proposal-search-builder.ts';
import type { ProposalsFilters } from '../shared/proposal-search-builder.types.ts';
import type { SocialLinks } from '../speaker-profile/speaker-profile.types.ts';
import type { ProposalUpdateData, ReviewUpdateData } from './proposal-review.types.ts';
import { ReviewDetails } from './review-details.ts';

export type ProposalReviewData = Awaited<ReturnType<typeof ProposalReview.prototype.get>>;

export class ProposalReview {
  constructor(
    private userId: string,
    private proposalId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string, proposalId: string) {
    console.log('>>>>>>>> Start UserEvent');
    console.time('UserEvent');
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    console.timeEnd('UserEvent');
    console.log('>>>>>>>> End UserEvent');
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
      },
      where: { id: this.proposalId },
    });
    if (!proposal) throw new ProposalNotFoundError();

    const reviews = new ReviewDetails(proposal.reviews);

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
          location: speaker.location,
          socials: speaker.socials as SocialLinks,
          survey: answers?.find((a) => a.userId === speaker.id)?.answers as SurveyData,
        })) || [],
    };
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
    console.log('>>>>>>>> Start Permissions');
    console.time('permissions');
    const event = await this.userEvent.needsPermission('canAccessEvent');
    console.timeEnd('permissions');
    console.log('>>>>>>>> End Permissions');
    if (!event.reviewEnabled) throw new ReviewDisabledError();

    await db.$transaction(async (trx) => {
      console.log('>>>>>>>> Start review.upsert');
      console.time('review.upsert');
      await trx.review.upsert({
        where: { userId_proposalId: { userId: this.userId, proposalId: this.proposalId } },
        create: { userId: this.userId, proposalId: this.proposalId, ...data },
        update: data,
      });
      console.timeEnd('review.upsert');
      console.log('>>>>>>>> End review.findMany');

      console.log('>>>>>>>> Start review.findMany');
      console.time('review.findMany');
      const reviews = await trx.review.findMany({
        where: { proposalId: this.proposalId, feeling: { not: 'NO_OPINION' } },
      });
      console.timeEnd('review.findMany');
      console.log('>>>>>>>> End review.findMany');

      console.log('>>>>>>>> Start proposal.update');
      console.time('proposal.update');
      const reviewsDetails = new ReviewDetails(reviews);
      const average = reviewsDetails.summary().average ?? null;
      await trx.proposal.update({ where: { id: this.proposalId }, data: { avgRateForSort: average } });
      console.timeEnd('proposal.update');
      console.log('>>>>>>>> End proposal.update');
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
}
