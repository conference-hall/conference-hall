import { db } from '@conference-hall/database';
import { ReviewDetails } from '~/features/event-management/proposals/models/review-details.ts';
import type { ProposalsFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { ProposalSearchBuilder } from '~/features/event-management/proposals/services/proposal-search-builder.server.ts';
import { SurveyConfig } from '~/features/event-management/settings/models/survey-config.ts';
import { SpeakerSurvey } from '~/features/event-participation/speaker-survey/services/speaker-survey.server.ts';
import { ApiKeyInvalidError, EventNotFoundError } from '~/shared/errors.server.ts';
import type { Languages } from '~/shared/types/proposals.types.ts';
import type { SocialLinks } from '~/shared/types/speaker.types.ts';
import type { SurveyDetailedAnswer } from '~/shared/types/survey.types.ts';

export class EventProposalsApi {
  constructor(
    private eventSlug: string,
    private apiKey: string,
  ) {}

  async proposals(filters: ProposalsFilters) {
    const event = await db.event.findFirst({ where: { slug: this.eventSlug } });

    if (!event) throw new EventNotFoundError();

    if (event.apiKey !== this.apiKey) throw new ApiKeyInvalidError();

    const search = new ProposalSearchBuilder(this.eventSlug, 'no-user', filters);

    const proposals = await search.proposals();

    let speakerSurveys: Record<string, Array<SurveyDetailedAnswer>> = {};
    const { isActiveForEvent } = new SurveyConfig(event.surveyConfig);

    if (isActiveForEvent) {
      const allSpeakerIds = [
        ...new Set(proposals.flatMap((proposal) => proposal.speakers.map((s) => s.userId).filter((id) => id !== null))),
      ];

      if (allSpeakerIds.length > 0) {
        const survey = SpeakerSurvey.for(event.slug);
        speakerSurveys = await survey.getMultipleSpeakerAnswers(event, allSpeakerIds);
      }
    }

    return {
      name: event.name,
      startDate: event.conferenceStart,
      endDate: event.conferenceEnd,
      proposals: proposals.map((proposal) => {
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
            survey: speaker.userId ? this.#mapSpeakerSurvey(speaker.userId, speakerSurveys) : [],
          })),
          review: reviews.summary(),
        };
      }),
    };
  }

  #mapSpeakerSurvey(userId: string, speakerSurveys: Record<string, Array<SurveyDetailedAnswer>>) {
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
}
