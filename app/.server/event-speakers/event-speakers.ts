import { parseWithZod } from '@conform-to/zod';
import type { Prisma } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { z } from 'zod';
import { UserEvent } from '../event-settings/user-event.ts';
import { Pagination } from '../shared/pagination.ts';

export const SpeakerSearchFiltersSchema = z.object({
  query: z.string().trim().optional(),
  proposalStatus: z.enum(['accepted', 'confirmed', 'declined']).optional(),
  sort: z.enum(['name-asc', 'name-desc']).optional(),
});

type SpeakerSearchFilters = z.infer<typeof SpeakerSearchFiltersSchema>;

export class EventSpeakers {
  constructor(private userEvent: UserEvent) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new EventSpeakers(userEvent);
  }

  async search(filters: SpeakerSearchFilters, page = 1) {
    const event = await this.userEvent.needsPermission('canAccessEvent');

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
}

export function parseUrlFilters(url: string) {
  const params = new URL(url).searchParams;
  const result = parseWithZod(params, { schema: SpeakerSearchFiltersSchema });
  if (result.status !== 'success') return {};
  return result.value;
}
