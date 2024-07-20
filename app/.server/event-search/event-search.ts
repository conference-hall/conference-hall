import type { Prisma } from '@prisma/client';
import { db } from 'prisma/db.server.ts';

import { Pagination } from '../shared/pagination.ts';
import type { SearchFilters } from './event-search.types.ts';

const RESULTS_BY_PAGE = 12;

export class EventsSearch {
  constructor(
    private filters: SearchFilters,
    private page: number = 1,
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
      ...this.mapFiltersQuery(type),
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
        cfpStart: event.cfpStart?.toISOString(),
        cfpEnd: event.cfpEnd?.toISOString(),
      })),
    };
  }

  private mapFiltersQuery(type?: string): Prisma.EventWhereInput {
    const INCOMING_CFP = {
      cfpStart: { not: null },
      OR: [{ cfpEnd: null }, { cfpEnd: { gt: new Date() } }],
    };

    switch (type) {
      case 'conference':
        return { type: 'CONFERENCE', ...INCOMING_CFP };
      case 'meetup':
        return { type: 'MEETUP', cfpStart: { not: null } };
      default:
        return { type: undefined, ...INCOMING_CFP };
    }
  }
}
