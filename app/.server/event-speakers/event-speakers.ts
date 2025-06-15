import { parseWithZod } from '@conform-to/zod';
import type { Prisma } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { z } from 'zod';
import { UserEvent } from '../event-settings/user-event.ts';
import { Pagination } from '../shared/pagination.ts';

export const SpeakerSearchFiltersSchema = z.object({
  query: z.string().trim().optional(),
});

type SpeakerSearchFilters = z.infer<typeof SpeakerSearchFiltersSchema>;

export class EventSpeakers {
  constructor(
    private userId: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new EventSpeakers(userId, userEvent);
  }

  async search(filters: SpeakerSearchFilters, page = 1) {
    const event = await this.userEvent.needsPermission('canAccessEvent');

    const { query } = filters;

    const whereClause: Prisma.EventSpeakerWhereInput = {
      eventId: event.id,
      name: query ? { contains: query, mode: 'insensitive' } : undefined,
    };

    const total = await db.eventSpeaker.count({ where: whereClause });

    const pagination = new Pagination({ page, total });

    const speakers = await db.eventSpeaker.findMany({
      where: whereClause,
      include: { proposals: true },
      orderBy: { name: 'asc' },
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
