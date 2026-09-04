import type { ProposalsFilters } from '~/features/event-management/proposals/services/proposal-search-builder.schema.server.ts';
import { ProposalSearchBuilder } from '~/features/event-management/proposals/services/proposal-search-builder.server.ts';
import { SpeakerSurvey } from '~/features/event-participation/speaker-survey/services/speaker-survey.server.ts';
import type { AuthorizedApiEvent, AuthorizedEvent } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import type { Languages } from '~/shared/types/proposals.types.ts';
import type { SurveyDetailedAnswer } from '~/shared/types/survey.types.ts';
import {
  ConfirmationStatus,
  DeliberationStatus,
  type Event,
  PublicationStatus,
  TalkLevel,
} from '../../../../../prisma/generated/client.ts';
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
    const search = new ProposalSearchBuilder(this.event.id, this.userId, filters, {
      withSpeakers: true,
      withReviews: true,
    });

    const proposals = await search.proposals();

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
      proposals: proposals.map((proposal) => ({
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
        languages: proposal.languages,
        speakers: proposal.speakers.map((speaker) => ({
          id: speaker.id,
          name: speaker.name,
          bio: speaker.bio,
          company: speaker.company,
          references: speaker.references,
          picture: speaker.picture,
          location: speaker.location,
          email: speaker.email,
          socialLinks: speaker.socialLinks,
          survey: speaker.userId ? this.mapSpeakerSurvey(speaker.userId, speakerSurveys) : [],
        })),
        review: proposal.reviews.summary,
      })),
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

    const proposals = await search.proposals();

    return proposals.map((proposal) => ({
      id: proposal.id,
      proposalNumber: proposal.proposalNumber,
      title: proposal.title,
      level: proposal.level,
      formats: proposal.formats,
      categories: proposal.categories,
      languages: proposal.languages as Languages,
      speakers: proposal.speakers.map((speaker) => speaker.name),
      reviews: proposal.reviews.summary,
    }));
  }

  async toOpenPlanner(filters: ProposalsFilters) {
    await exportToOpenPlanner.trigger({ userId: this.userId, eventId: this.event.id, filters });
  }

  // Representative example used to document the API response when an event has no proposals yet.
  static sampleJson(): ProposalsExportJson {
    return {
      name: 'My Conference',
      startDate: new Date('2026-06-01T08:00:00.000Z'),
      endDate: new Date('2026-06-02T18:00:00.000Z'),
      proposals: [
        {
          id: 'prop_1a2b3c',
          proposalNumber: 42,
          title: 'Building resilient APIs with TypeScript',
          abstract: 'A deep dive into designing robust, type-safe HTTP APIs that scale.',
          submittedAt: new Date('2026-01-15T10:30:00.000Z'),
          deliberationStatus: DeliberationStatus.ACCEPTED,
          confirmationStatus: ConfirmationStatus.CONFIRMED,
          publicationStatus: PublicationStatus.PUBLISHED,
          level: TalkLevel.INTERMEDIATE,
          references: 'https://github.com/jane-doe/talks',
          formats: ['Conference talk'],
          categories: ['Backend'],
          tags: ['typescript', 'api'],
          languages: ['en'],
          speakers: [
            {
              id: 'spk_9z8y7x',
              name: 'Jane Doe',
              bio: 'Senior software engineer focused on developer experience.',
              company: 'Acme Corp',
              references: 'Previously spoke at DevConf and NodeSummit.',
              picture: 'https://example.com/speakers/jane-doe.jpg',
              location: 'Paris, France',
              email: 'jane.doe@example.com',
              socialLinks: ['https://twitter.com/jane_doe', 'https://github.com/jane-doe'],
              survey: [],
            },
          ],
          review: { average: 4.2, positives: 3, negatives: 0 },
        },
      ],
    };
  }
}

export type ProposalsExportJson = Awaited<ReturnType<ProposalsExport['toJson']>>;
