import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { getCfpState } from '~/utils/event';
import { db } from '../db';
import { EventNotFoundError } from '../errors';

/**
 * Get event for user
 * @param slug event slug
 * @param uid Id of the user
 * @returns event
 */
export async function getEvent(slug: string, uid: string) {
  const event = await db.event.findFirst({
    include: { formats: true, categories: true },
    where: { slug, organization: { members: { some: { memberId: uid } } } },
  });
  if (!event) throw new EventNotFoundError();
  return {
    name: event.name,
    slug: event.slug,
    type: event.type,
    visibility: event.visibility,
    cfpStart: event.cfpStart?.toUTCString(),
    cfpEnd: event.cfpEnd?.toUTCString(),
    cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
    formats: event.formats.map(({ id, name }) => ({ id, name })),
    categories: event.categories.map(({ id, name }) => ({ id, name })),
  };
}

const RESULTS_BY_PAGE = 25;

export async function getProposals(slug: string, uid: string, filters: Filters, page: Pagination = 1) {
  const { query, ratings, formats, categories, status } = filters;

  const ratingClause = ratings === 'rated' ? { some: { userId: uid } } : { none: { userId: uid } };

  const proposalsWhereInput: Prisma.ProposalWhereInput = {
    status,
    event: { slug, organization: { members: { some: { memberId: uid } } } },
    formats: formats ? { some: { id: formats } } : {},
    categories: categories ? { some: { id: categories } } : {},
    ratings: ratings ? ratingClause : {},
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { speakers: { some: { name: { contains: query, mode: 'insensitive' } } } },
    ],
  };

  const proposalsCount = await db.proposal.count({ where: proposalsWhereInput });
  const total = Math.ceil(proposalsCount / RESULTS_BY_PAGE);
  const pageIndex = computePageIndex(page, total);

  const proposals = await db.proposal.findMany({
    include: { speakers: true, ratings: true },
    where: proposalsWhereInput,
    orderBy: [orderBy(filters), { title: 'asc' }],
    skip: pageIndex * RESULTS_BY_PAGE,
    take: RESULTS_BY_PAGE,
  });

  return {
    filters,
    pagination: { current: pageIndex + 1, total },
    results: proposals.map((proposal) => ({
      id: proposal.id,
      title: proposal.title,
      status: proposal.status,
      speakers: proposal.speakers.map(({ name }) => name),
      ratings: { hates: 0, loves: 0, you: 0, total: 0 },
    })),
  };
}

function orderBy({ sort }: Filters): Prisma.ProposalOrderByWithRelationInput {
  if (sort === 'oldest') return { createdAt: 'asc' };
  return { createdAt: 'desc' };
}

function computePageIndex(current: number, total: number) {
  if (total === 0) return 0;
  if (current <= 0) return 0;
  if (current > total) return total - 1;
  return current - 1;
}

export type Filters = z.infer<typeof FiltersSchema>;

const FiltersSchema = z.object({
  query: z.string().trim().optional(),
  sort: z.enum(['newest', 'oldest']).optional(),
  ratings: z.enum(['rated', 'not-rated']).optional(),
  status: z.enum(['SUBMITTED', 'ACCEPTED', 'REJECTED', 'CONFIRMED', 'DECLINED']).optional(),
  formats: z.string().optional(),
  categories: z.string().optional(),
});

export function validateFilters(params: URLSearchParams) {
  const result = FiltersSchema.safeParse({
    query: params.get('query') || undefined,
    sort: params.get('sort') || undefined,
    ratings: params.get('ratings') || undefined,
    status: params.get('status') || undefined,
    formats: params.get('formats') || undefined,
    categories: params.get('categories') || undefined,
  });
  return result.success ? result.data : {};
}

export type Pagination = z.infer<typeof PaginationSchema>;

const PaginationSchema = z.preprocess((a) => parseInt(a as string, 10), z.number().positive().optional());

export function validatePage(params: URLSearchParams) {
  const result = PaginationSchema.safeParse(params.get('page'));
  return result.success ? result.data : 1;
}
