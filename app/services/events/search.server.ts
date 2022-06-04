import z from 'zod';
import { EventVisibility, Prisma } from '@prisma/client';
import { CfpState, getCfpState } from '~/utils/event';
import { db } from '../../services/db';

export type SearchEvents = {
  filters: SearchFilters;
  results: Array<{
    slug: string;
    name: string;
    type: 'CONFERENCE' | 'MEETUP';
    address: string | null;
    cfpState: CfpState;
  }>;
};

export async function searchEvents(filters: SearchFilters): Promise<SearchEvents> {
  const { terms, type, cfp } = filters;

  const events = await db.event.findMany({
    select: { slug: true, name: true, type: true, address: true, cfpStart: true, cfpEnd: true },
    where: {
      visibility: EventVisibility.PUBLIC,
      name: { contains: terms, mode: 'insensitive' },
      ...mapFilters(type, cfp),
    },
    orderBy: { cfpStart: 'desc' },
  });

  return {
    filters,
    results: events.map((event) => ({
      slug: event.slug,
      name: event.name,
      type: event.type,
      address: event.address,
      cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
    })),
  };
}

function mapFilters(type?: string, cfp?: string): Prisma.EventWhereInput {
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
  })
);

export function validateFilters(params: URLSearchParams) {
  const result = SearchFiltersSchema.safeParse({
    terms: params.get('terms'),
    type: params.get('type'),
    cfp: params.get('cfp'),
  });
  return result.success ? result.data : {};
}
