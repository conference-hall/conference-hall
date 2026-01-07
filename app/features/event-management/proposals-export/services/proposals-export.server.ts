import type { Event } from 'prisma/generated/client.ts';
import { ReviewDetails } from '~/features/event-management/proposals/models/review-details.ts';
import type { ProposalsFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { ProposalSearchBuilder } from '~/features/event-management/proposals/services/proposal-search-builder.server.ts';
import { SpeakerSurvey } from '~/features/event-participation/speaker-survey/services/speaker-survey.server.ts';
import type { AuthorizedApiEvent, AuthorizedEvent } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import type { Languages } from '~/shared/types/proposals.types.ts';
import type { SocialLinks } from '~/shared/types/speaker.types.ts';
import type { SurveyDetailedAnswer } from '~/shared/types/survey.types.ts';
import { SurveyConfig } from '../../settings/models/survey-config.ts';
import { exportToOpenPlanner } from './jobs/export-to-open-planner.job.ts';

export class ProposalsExport {
  private constructor(
    private userId: string,
    private event: Event,
  ) {}

  static forUser(authorizedEvent: AuthorizedEvent) {
    const { userId, event, permissions } = authorizedEvent;
    if (!permissions.canExportEventProposals) throw new ForbiddenOperationError();
    return new ProposalsExport(userId, event);
  }

  static forApi(authorizedApiEvent: AuthorizedApiEvent) {
    const { event } = authorizedApiEvent;
    return new ProposalsExport('no-user', event);
  }

  async toJson(filters: ProposalsFilters) {
    const search = new ProposalSearchBuilder(this.event.id, this.userId, filters);

    const proposals = await search.proposals({ reviews: true });

    let speakerSurveys: Record<string, Array<SurveyDetailedAnswer>> = {};
    const { isActiveForEvent } = new SurveyConfig(this.event.surveyConfig);

    if (isActiveForEvent) {
      const allSpeakerIds = [
        ...new Set(proposals.flatMap((proposal) => proposal.speakers.map((s) => s.userId).filter((id) => id !== null))),
      ];

      if (allSpeakerIds.length > 0) {
        const survey = SpeakerSurvey.for(this.event.slug);
        speakerSurveys = await survey.getMultipleSpeakerAnswers(this.event, allSpeakerIds);
      }
    }

    return {
      name: this.event.name,
      startDate: this.event.conferenceStart,
      endDate: this.event.conferenceEnd,
      proposals: proposals.map((proposal) => {
        const reviews = new ReviewDetails(proposal.reviews);

        return {
          id: proposal.id,
          proposalNumber: proposal.proposalNumber,
          title: proposal.title,
          abstract: proposal.abstract,
          submittedAt: proposal.submittedAt,
          deliberationStatus: proposal.deliberationStatus,
          confirmationStatus: proposal.confirmationStatus,
          publicationStatus: proposal.publicationStatus,
          level: proposal.level,
          references: proposal.references,
          formats: proposal.formats.map((f) => f.name),
          categories: proposal.categories.map((c) => c.name),
          tags: proposal.tags.map((tag) => tag.name),
          languages: proposal.languages as Languages,
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
            survey: speaker.userId ? this.mapSpeakerSurvey(speaker.userId, speakerSurveys) : [],
          })),
          review: reviews.summary(),
        };
      }),
    };
  }

  private mapSpeakerSurvey(userId: string, speakerSurveys: Record<string, Array<SurveyDetailedAnswer>>) {
    const survey = speakerSurveys[userId];
    if (!survey) return [];

    return survey.map((question) => {
      if (question.type === 'text') {
        return { id: question.id, question: question.label, answer: question.answer };
      } else if (question.type === 'radio') {
        return { id: question.id, question: question.label, answer: question.answers.at(0)?.label };
      } else {
        return { id: question.id, question: question.label, answer: question.answers.map((answer) => answer.label) };
      }
    });
  }

  async toCards(filters: ProposalsFilters) {
    const search = new ProposalSearchBuilder(this.event.id, this.userId, filters, {
      withSpeakers: true,
      withReviews: true,
    });

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

  async toOpenPlanner(filters: ProposalsFilters) {
    await exportToOpenPlanner.trigger({ userId: this.userId, eventId: this.event.id, filters });
  }
}
