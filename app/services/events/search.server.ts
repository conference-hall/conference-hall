import type { Prisma } from '@prisma/client';
import { EventVisibility } from '@prisma/client';
import { getCfpState } from '~/utils/event';
import { db } from '../db';
import { getPagination } from '../utils/pagination.server';
import { z } from 'zod';
import { makeDomainFunction } from 'domain-functions';
import { numeric, text } from 'zod-form-data';

const RESULTS_BY_PAGE = 12;

const Schema = z.object({
  query: text(z.string().trim().optional()),
  type: text(z.enum(['all', 'conference', 'meetup']).optional()),
  cfp: text(z.enum(['incoming', 'past']).optional()),
  talkId: text(z.string().trim().optional()),
  page: numeric(z.number().default(1)),
});

export function parseFilters(data: Record<string, unknown>) {
  const result = Schema.safeParse(data);
  return result.success ? result.data : {};
}

export const searchEvents = makeDomainFunction(Schema)(async ({ query, type, cfp, talkId, page }) => {
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
    filters: { query, type, cfp, talkId },
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
});

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
