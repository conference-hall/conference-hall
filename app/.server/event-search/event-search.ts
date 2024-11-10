import { EventType, type Prisma } from '@prisma/client';
import { db } from 'prisma/db.server.ts';

import { Pagination } from '../shared/pagination.ts';
import type { SearchFilters } from './event-search.types.ts';

const RESULTS_BY_PAGE = 12;

export class EventsSearch {
  constructor(
    private filters: SearchFilters,
    private page = 1,
  ) {}

  static with(filters: SearchFilters, page?: number) {
    return new EventsSearch(filters, page);
  }

  async search() {
    const { query, type } = this.filters;

    const eventsWhereInput: Prisma.EventWhereInput = {
      visibility: 'PUBLIC',
      archived: false,
      name: { contains: query, mode: 'insensitive' },
      ...this.byEventType(type),
    };

    const eventsCount = await db.event.count({ where: eventsWhereInput });
    const pagination = new Pagination({ page: this.page, pageSize: RESULTS_BY_PAGE, total: eventsCount });

    const events = await db.event.findMany({
      where: eventsWhereInput,
      orderBy: [{ type: 'desc' }, { cfpStart: 'desc' }, { name: 'asc' }],
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
    });

    return {
      filters: this.filters,
      pagination: {
        current: pagination.page,
        total: pagination.pageCount,
      },
      results: events.map((event) => ({
        slug: event.slug,
        name: event.name,
        type: event.type,
        location: event.location,
        logoUrl: event.logoUrl,
        cfpState: event.cfpState,
        timezone: event.timezone,
        cfpStart: event.cfpStart,
        cfpEnd: event.cfpEnd,
      })),
    };
  }

  private byEventType(type?: string): Prisma.EventWhereInput {
    const OPEN_MEETUP = { type: EventType.MEETUP, cfpStart: { not: null } };
    const OPEN_CONFERENCE = { type: EventType.CONFERENCE, cfpEnd: { gte: new Date() } };

    switch (type) {
      case 'conference':
        return OPEN_CONFERENCE;
      case 'meetup':
        return OPEN_MEETUP;
      default:
        return { OR: [OPEN_MEETUP, OPEN_CONFERENCE] };
    }
  }
}
