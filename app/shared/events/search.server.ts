import type { Prisma } from '@prisma/client';
import { EventVisibility } from '@prisma/client';
import { getCfpState } from '~/utils/event';
import { db } from '../../libs/db';
import { getPagination } from '../pagination/pagination.server';
import type { SearchFilters } from '~/schemas/search';
import type { Pagination } from '~/schemas/pagination';

const RESULTS_BY_PAGE = 12;

export async function searchEvents(filters: SearchFilters, page: Pagination = 1) {
  const { query, type, cfp } = filters;

  const eventsWhereInput: Prisma.EventWhereInput = {
    visibility: EventVisibility.PUBLIC,
    archived: false,
    name: { contains: query, mode: 'insensitive' },
    ...mapFiltersQuery(type, cfp),
  };

  const eventsCount = await db.event.count({ where: eventsWhereInput });
  const pagination = getPagination(page, eventsCount, RESULTS_BY_PAGE);

  const events = await db.event.findMany({
    select: { slug: true, name: true, type: true, address: true, cfpStart: true, cfpEnd: true },
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
      cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
      cfpStart: event.cfpStart?.toUTCString(),
      cfpEnd: event.cfpEnd?.toUTCString(),
    })),
  };
}

function mapFiltersQuery(type?: string, cfp?: string): Prisma.EventWhereInput {
  const PAST_CFP = { cfpEnd: { lt: new Date() } };
  const INCOMING_CFP = {
    cfpStart: { not: null },
    OR: [{ cfpEnd: null }, { cfpEnd: { gt: new Date() } }],
  };
  const cfpFilter = cfp === 'past' ? PAST_CFP : INCOMING_CFP;

  switch (type) {
    case 'conference':
      return { type: 'CONFERENCE', ...cfpFilter };
    case 'meetup':
      return { type: 'MEETUP', cfpStart: { not: null } };
    default:
      return { type: undefined, ...cfpFilter };
  }
}
