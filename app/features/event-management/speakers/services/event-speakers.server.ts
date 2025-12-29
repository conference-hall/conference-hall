import { parseWithZod } from '@conform-to/zod/v4';
import { db } from 'prisma/db.server.ts';
import type { EventSpeakerWhereInput } from 'prisma/generated/models.ts';
import { z } from 'zod';
import { ReviewDetails } from '~/features/event-management/proposals/models/review-details.ts';
import { SpeakerSurvey } from '~/features/event-participation/speaker-survey/services/speaker-survey.server.ts';
import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError, NotFoundError, SpeakerEmailAlreadyExistsError } from '~/shared/errors.server.ts';
import { Pagination } from '~/shared/pagination/pagination.ts';
import type { EventSpeakerSaveData, SocialLinks } from '~/shared/types/speaker.types.ts';
import type { SurveyDetailedAnswer } from '~/shared/types/survey.types.ts';

const SpeakerSearchFiltersSchema = z.object({
  query: z.string().trim().optional(),
  proposalStatus: z.enum(['accepted', 'confirmed', 'declined']).optional(),
  sort: z.enum(['name-asc', 'name-desc']).optional(),
});

type SpeakerSearchFilters = z.infer<typeof SpeakerSearchFiltersSchema>;

export class EventSpeakers {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new EventSpeakers(authorizedEvent);
  }

  async search(filters: SpeakerSearchFilters, page = 1) {
    const { event } = this.authorizedEvent;

    if (!event.displayProposalsSpeakers) {
      return {
        speakers: [],
        filters,
        pagination: { current: 1, total: 0 },
        statistics: { total: 0 },
      };
    }

    const { query, proposalStatus, sort = 'name-asc' } = filters;

    const whereClause: EventSpeakerWhereInput = { eventId: event.id };

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { equals: query, mode: 'insensitive' } },
      ];
    }

    if (proposalStatus === 'accepted') {
      whereClause.proposals = {
        some: { deliberationStatus: 'ACCEPTED', isDraft: false },
      };
    } else if (proposalStatus === 'confirmed') {
      whereClause.proposals = {
        some: { confirmationStatus: 'CONFIRMED', isDraft: false },
      };
    } else if (proposalStatus === 'declined') {
      whereClause.proposals = {
        some: { confirmationStatus: 'DECLINED', isDraft: false },
      };
    }

    const total = await db.eventSpeaker.count({ where: whereClause });

    const pagination = new Pagination({ page, total });

    const speakers = await db.eventSpeaker.findMany({
      where: whereClause,
      include: { proposals: true },
      orderBy: { name: sort === 'name-desc' ? 'desc' : 'asc' },
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
    });

    return {
      speakers: speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        picture: speaker.picture,
        company: speaker.company,
        proposals: speaker.proposals
          .filter((proposal) => !proposal.isDraft)
          .map((proposal) => ({
            id: proposal.id,
            title: proposal.title,
            deliberationStatus: proposal.deliberationStatus,
            confirmationStatus: proposal.confirmationStatus,
          })),
      })),
      filters,
      pagination: { current: pagination.page, total: pagination.pageCount },
      statistics: { total },
    };
  }

  async getById(speakerId: string) {
    const { event } = this.authorizedEvent;

    const speaker = await db.eventSpeaker.findFirst({
      where: { id: speakerId, eventId: event.id },
      include: {
        proposals: {
          where: { isDraft: false },
          include: { speakers: true, reviews: true, comments: true, tags: true },
        },
      },
    });

    if (!speaker) return null;

    let answers: Record<string, Array<SurveyDetailedAnswer>> = {};
    if (speaker.userId) {
      const survey = SpeakerSurvey.for(event.slug);
      answers = await survey.getMultipleSpeakerAnswers(event, [speaker.userId]);
    }

    return {
      id: speaker.id,
      name: speaker.name,
      email: speaker.email,
      bio: speaker.bio,
      picture: speaker.picture,
      company: speaker.company,
      location: speaker.location,
      references: speaker.references,
      socialLinks: speaker.socialLinks as SocialLinks,
      userId: speaker.userId,
      survey: speaker.userId ? answers[speaker.userId] : [],
      proposals: speaker.proposals
        .map((proposal) => {
          const reviews = new ReviewDetails(proposal.reviews);
          return {
            id: proposal.id,
            proposalNumber: proposal.proposalNumber,
            title: proposal.title,
            deliberationStatus: proposal.deliberationStatus,
            publicationStatus: proposal.publicationStatus,
            confirmationStatus: proposal.confirmationStatus,
            archivedAt: proposal.archivedAt,
            submittedAt: proposal.submittedAt,
            speakers: proposal.speakers.map((speaker) => ({ name: speaker.name })),
            reviews: {
              summary: event.displayProposalsReviews ? reviews.summary() : undefined,
              you: reviews.ofUser(this.authorizedEvent.userId),
            },
            comments: { count: proposal.comments.length },
            tags: proposal.tags,
          };
        })
        .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()),
    };
  }

  async create(data: EventSpeakerSaveData) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canCreateEventSpeaker) throw new ForbiddenOperationError();

    const existingSpeaker = await db.eventSpeaker.findFirst({
      where: { eventId: event.id, email: { equals: data.email, mode: 'insensitive' } },
    });

    if (existingSpeaker) {
      throw new SpeakerEmailAlreadyExistsError();
    }

    const speaker = await db.eventSpeaker.create({
      data: {
        eventId: event.id,
        userId: null,
        name: data.name,
        email: data.email,
        picture: data.picture,
        bio: data.bio,
        company: data.company,
        location: data.location,
        references: data.references,
        socialLinks: data.socialLinks,
      },
    });

    return {
      id: speaker.id,
      name: speaker.name,
      email: speaker.email,
      picture: speaker.picture,
      bio: speaker.bio,
      company: speaker.company,
      location: speaker.location,
      references: speaker.references,
      socialLinks: speaker.socialLinks as SocialLinks,
    };
  }

  async update(speakerId: string, data: EventSpeakerSaveData) {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEventSpeaker) throw new ForbiddenOperationError();

    const speaker = await db.eventSpeaker.findFirst({
      where: { id: speakerId, eventId: event.id },
    });

    if (!speaker) throw new NotFoundError('Speaker not found');

    if (data.email !== speaker.email) {
      const existingSpeaker = await db.eventSpeaker.findFirst({
        where: { eventId: event.id, email: { equals: data.email, mode: 'insensitive' }, id: { not: speakerId } },
      });

      if (existingSpeaker) throw new SpeakerEmailAlreadyExistsError();
    }

    return db.eventSpeaker.update({ where: { id: speakerId, eventId: event.id }, data });
  }
}

export function parseUrlFilters(url: string) {
  const params = new URL(url).searchParams;
  const result = parseWithZod(params, { schema: SpeakerSearchFiltersSchema });
  if (result.status !== 'success') return {};
  return result.value;
}
