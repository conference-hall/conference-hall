import z from 'zod';
import { EventVisibility, Prisma } from '@prisma/client';
import { CfpState, getCfpState } from '~/utils/event';
import { db } from '../../services/db';

export type SearchEvents = {
  filters: SearchFilters;
  pagination: {
    current: number;
    total: number;
  };
  results: Array<{
    slug: string;
    name: string;
    type: 'CONFERENCE' | 'MEETUP';
    address: string | null;
    cfpState: CfpState;
  }>;
};

const RESULTS_BY_PAGE = 12;

export async function searchEvents(filters: SearchFilters, page: SearchPage = 1): Promise<SearchEvents> {
  const { terms, type, cfp } = filters;

  const eventsWhereInput: Prisma.EventWhereInput = {
    visibility: EventVisibility.PUBLIC,
    archived: false,
    name: { contains: terms, mode: 'insensitive' },
    ...mapFiltersQuery(type, cfp),
  };

  const eventsCount = await db.event.count({ where: eventsWhereInput });
  const total = Math.ceil(eventsCount / RESULTS_BY_PAGE);

  const pageIndex = computePageIndex(page, total)

  const events = await db.event.findMany({
    select: { slug: true, name: true, type: true, address: true, cfpStart: true, cfpEnd: true },
    where: eventsWhereInput,
    orderBy: [{ cfpStart: 'desc' }, { name: 'asc' }],
    skip: pageIndex * RESULTS_BY_PAGE,
    take: RESULTS_BY_PAGE,
  });

  return {
    filters,
    pagination: { current: pageIndex + 1, total },
    results: events.map((event) => ({
      slug: event.slug,
      name: event.name,
      type: event.type,
      address: event.address,
      cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
    })),
  };
}

function computePageIndex(current: number, total: number) {
  if (total === 0) return 0;
  if (current <= 0) return 0;
  if (current > total) return total - 1;
  return current - 1;
}

function mapFiltersQuery(type?: string, cfp?: string): Prisma.EventWhereInput {
  const PAST_CFP = { cfpEnd: { lt: new Date() } };
  const INCOMING_CFP = { cfpStart: { not: null }, OR: [{ cfpEnd: null }, { cfpEnd: { gt: new Date() } }] };
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

export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

const SearchFiltersSchema = z.preprocess(
  (filters: any) => ({
    ...filters,
    terms: filters.terms?.trim(),
    type: ['all', 'conference', 'meetup'].includes(filters.type) ? filters.type : undefined,
    cfp: ['incoming', 'past'].includes(filters.cfp) ? filters.cfp : undefined,
  }),
  z.object({
    terms: z.string().optional(),
    type: z.enum(['all', 'conference', 'meetup']).optional(),
    cfp: z.enum(['incoming', 'past']).optional(),
    talkId: z.string().optional(),
  })
);

export function validateFilters(params: URLSearchParams) {
  const result = SearchFiltersSchema.safeParse({
    terms: params.get('terms'),
    type: params.get('type'),
    cfp: params.get('cfp'),
    talkId: params.get('talkId'),
  });
  return result.success ? result.data : {};
}

export type SearchPage = z.infer<typeof SearchPageSchema>;

const SearchPageSchema = z.preprocess((a) => parseInt(a as string, 10), z.number().positive().optional());

export function validatePage(params: URLSearchParams) {
  const result = SearchPageSchema.safeParse(params.get('page'));
  return result.success ? result.data : 1;
}
