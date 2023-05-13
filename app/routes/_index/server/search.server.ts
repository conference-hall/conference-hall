import type { Prisma } from '@prisma/client';
import { EventVisibility } from '@prisma/client';
import { db } from '~/libs/db';
import { getCfpState } from '~/utils/event';
import type { Pagination } from '~/schemas/pagination';
import { getPagination } from '~/shared-server/pagination/pagination.server';
import { z } from 'zod';
import { text } from '~/schemas/utils';

const SearchFiltersSchema = z.object({
  query: text().optional(),
  type: text(z.enum(['all', 'conference', 'meetup'])).optional(),
  talkId: text().optional(),
});

export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

const RESULTS_BY_PAGE = 12;

export async function searchEvents(filters: SearchFilters, page: Pagination = 1) {
  const { query, type } = filters;

  const eventsWhereInput: Prisma.EventWhereInput = {
    visibility: EventVisibility.PUBLIC,
    archived: false,
    name: { contains: query, mode: 'insensitive' },
    ...mapFiltersQuery(type),
  };

  const eventsCount = await db.event.count({ where: eventsWhereInput });
  const pagination = getPagination(page, eventsCount, RESULTS_BY_PAGE);

  const events = await db.event.findMany({
    select: { slug: true, name: true, type: true, address: true, cfpStart: true, cfpEnd: true, logo: true },
    where: eventsWhereInput,
    orderBy: [{ cfpStart: 'desc' }, { name: 'asc' }],
    skip: pagination.pageIndex * RESULTS_BY_PAGE,
    take: RESULTS_BY_PAGE,
  });

  return {
    filters,
    pagination: {
      current: pagination.currentPage,
      total: pagination.totalPages,
    },
    results: events.map((event) => ({
      slug: event.slug,
      name: event.name,
      type: event.type,
      address: event.address,
      logo: event.logo,
      cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
      cfpStart: event.cfpStart?.toUTCString(),
      cfpEnd: event.cfpEnd?.toUTCString(),
    })),
  };
}

export function parseFilters(params: URLSearchParams) {
  const result = SearchFiltersSchema.safeParse(Object.fromEntries(params));
  return result.success ? result.data : {};
}

function mapFiltersQuery(type?: string): Prisma.EventWhereInput {
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
