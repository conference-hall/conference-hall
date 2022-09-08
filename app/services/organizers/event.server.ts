import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { getCfpState } from '~/utils/event';
import { db } from '../db';
import { EventNotFoundError } from '../errors';
import type { Pagination } from '../utils/pagination.server';
import { getPagination } from '../utils/pagination.server';
import { RatingsDetails } from '../utils/ratings.server';

/**
 * Get event for user
 * @param slug event's slug
 * @param uid Id of the user (member of the event's organization)
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

/**
 * Search for event proposals
 * @param slug event's slug
 * @param uid Id of the user (member of the event's organization)
 * @param filters Filters to apply to the search
 * @param page Results page number
 * @returns results of the search with filters, pagination and total results
 */
export async function searchProposals(slug: string, uid: string, filters: Filters, page: Pagination = 1) {
  const { query, ratings, formats, categories, status } = filters;

  const ratingClause = ratings === 'rated' ? { some: { userId: uid } } : { none: { userId: uid } };

  const proposalsWhereInput: Prisma.ProposalWhereInput = {
    event: { slug, organization: { members: { some: { memberId: uid } } } },
    status: { equals: status, not: 'DRAFT' },
    formats: formats ? { some: { id: formats } } : {},
    categories: categories ? { some: { id: categories } } : {},
    ratings: ratings ? ratingClause : {},
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { speakers: { some: { name: { contains: query, mode: 'insensitive' } } } },
    ],
  };

  const proposalsCount = await db.proposal.count({ where: proposalsWhereInput });
  const pagination = getPagination(page, proposalsCount, RESULTS_BY_PAGE);

  const proposals = await db.proposal.findMany({
    include: { speakers: true, ratings: true },
    where: proposalsWhereInput,
    orderBy: [orderBy(filters), { title: 'asc' }],
    skip: pagination.pageIndex * RESULTS_BY_PAGE,
    take: RESULTS_BY_PAGE,
  });

  return {
    filters,
    total: proposalsCount,
    pagination: {
      current: pagination.currentPage,
      total: pagination.totalPages,
    },
    results: proposals.map((proposal) => {
      const ratings = new RatingsDetails(proposal.ratings);
      return {
        id: proposal.id,
        title: proposal.title,
        status: proposal.status,
        speakers: proposal.speakers.map(({ name }) => name),
        ratings: {
          positives: ratings.positives,
          negatives: ratings.negatives,
          you: ratings.fromUser(uid)?.rating ?? null,
          total: ratings.average,
        },
      };
    }),
  };
}

function orderBy({ sort }: Filters): Prisma.ProposalOrderByWithRelationInput {
  if (sort === 'oldest') return { createdAt: 'asc' };
  return { createdAt: 'desc' };
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
