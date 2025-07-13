import { parseWithZod } from '@conform-to/zod/v4';
import type { Prisma } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { z } from 'zod/v4';
import { ReviewDetails } from '~/features/event-management/proposals/models/review-details.ts';
import { SpeakerSurvey } from '~/features/event-participation/speaker-survey/services/speaker-survey.server.ts';
import { Pagination } from '~/shared/pagination/pagination.ts';
import type { SocialLinks } from '~/shared/types/speaker.types.ts';
import type { SurveyDetailedAnswer } from '~/shared/types/survey.types.ts';
import { UserEventAuthorization } from '~/shared/user/user-event-authorization.server.ts';

const SpeakerSearchFiltersSchema = z.object({
  query: z.string().trim().optional(),
  proposalStatus: z.enum(['accepted', 'confirmed', 'declined']).optional(),
  sort: z.enum(['name-asc', 'name-desc']).optional(),
});

type SpeakerSearchFilters = z.infer<typeof SpeakerSearchFiltersSchema>;

export class EventSpeakers extends UserEventAuthorization {
  static for(userId: string, team: string, event: string) {
    return new EventSpeakers(userId, team, event);
  }

  async search(filters: SpeakerSearchFilters, page = 1) {
    const event = await this.needsPermission('canAccessEvent');

    const { query, proposalStatus, sort = 'name-asc' } = filters;

    const whereClause: Prisma.EventSpeakerWhereInput = {
      eventId: event.id,
      name: query ? { contains: query, mode: 'insensitive' } : undefined,
      proposals: proposalStatus
        ? proposalStatus === 'accepted'
          ? {
              some: {
                deliberationStatus: 'ACCEPTED',
                isDraft: false,
              },
            }
          : proposalStatus === 'confirmed'
            ? {
                some: {
                  confirmationStatus: 'CONFIRMED',
                  isDraft: false,
                },
              }
            : proposalStatus === 'declined'
              ? {
                  some: {
                    confirmationStatus: 'DECLINED',
                    isDraft: false,
                  },
                }
              : undefined
        : undefined,
    };

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
    const event = await this.needsPermission('canAccessEvent');

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
            title: proposal.title,
            deliberationStatus: proposal.deliberationStatus,
            publicationStatus: proposal.publicationStatus,
            confirmationStatus: proposal.confirmationStatus,
            createdAt: proposal.createdAt,
            speakers: proposal.speakers.map((speaker) => ({ name: speaker.name })),
            reviews: {
              summary: event.displayProposalsReviews ? reviews.summary() : undefined,
              you: reviews.ofUser(this.userId),
            },
            comments: { count: proposal.comments.length },
            tags: proposal.tags,
          };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    };
  }
}

export function parseUrlFilters(url: string) {
  const params = new URL(url).searchParams;
  const result = parseWithZod(params, { schema: SpeakerSearchFiltersSchema });
  if (result.status !== 'success') return {};
  return result.value;
}
