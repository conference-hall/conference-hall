import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { getCfpState } from '~/utils/event';
import { jsonToArray } from '~/utils/prisma';
import { db } from '../db';
import { EventNotFoundError, ForbiddenOperationError, ProposalNotFoundError } from '../errors';
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
  const whereClause = proposalWhereInput(slug, uid, filters);
  const orderByClause = proposalOrderBy(filters);

  const proposalsCount = await db.proposal.count({ where: whereClause });
  const pagination = getPagination(page, proposalsCount, RESULTS_BY_PAGE);

  const proposals = await db.proposal.findMany({
    include: { speakers: true, ratings: true },
    where: whereClause,
    orderBy: orderByClause,
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

function proposalWhereInput(slug: string, uid: string, filters: Filters): Prisma.ProposalWhereInput {
  const { query, ratings, formats, categories, status } = filters;
  const ratingClause = ratings === 'rated' ? { some: { userId: uid } } : { none: { userId: uid } };

  return {
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
}

function proposalOrderBy(filters: Filters): Prisma.ProposalOrderByWithRelationInput[] {
  if (filters.sort === 'oldest') return [{ createdAt: 'asc' }, { title: 'asc' }];
  return [{ createdAt: 'desc' }, { title: 'asc' }];
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

/**
 * Retrieve proposal informations
 * @param eventSlug event slug
 * @param proposalId Proposal id
 * @param uid User id
 * @param filters Search filters
 */
export async function getProposalReview(eventSlug: string, proposalId: string, uid: string, filters: Filters) {
  const event = await db.event.findFirst({
    where: { slug: eventSlug, organization: { members: { some: { memberId: uid } } } },
  });
  if (!event) throw new ForbiddenOperationError();

  const whereClause = proposalWhereInput(eventSlug, uid, filters);
  const orderByClause = proposalOrderBy(filters);

  const proposalIds = (
    await db.proposal.findMany({
      select: { id: true },
      where: whereClause,
      orderBy: orderByClause,
    })
  ).map(({ id }) => id);

  const totalProposals = proposalIds.length;
  const curIndex = proposalIds.findIndex((id) => id === proposalId);
  const previousId = proposalIds.at(curIndex - 1);
  const nextId = curIndex + 1 >= totalProposals ? proposalIds.at(0) : proposalIds.at(curIndex + 1);

  const proposal = await db.proposal.findFirst({
    include: {
      speakers: true,
      formats: true,
      categories: true,
      ratings: { include: { user: true } },
      messages: { include: { user: true } },
    },
    where: { id: proposalId },
  });
  if (!proposal) throw new ProposalNotFoundError();

  const ratingDetails = new RatingsDetails(proposal.ratings);
  const userRating = ratingDetails.fromUser(uid);

  return {
    pagination: {
      total: totalProposals,
      current: curIndex + 1,
      previousId,
      nextId,
    },
    proposal: {
      title: proposal.title,
      abstract: proposal.abstract,
      references: proposal.references,
      comments: proposal.comments,
      level: proposal.level,
      languages: jsonToArray(proposal.languages),
      formats: proposal.formats.map(({ name }) => name),
      categories: proposal.categories.map(({ name }) => name),
      speakers: proposal.speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        photoURL: speaker.photoURL,
        bio: speaker.bio,
        references: speaker.references,
        email: speaker.email,
        company: speaker.company,
        address: speaker.address,
        github: speaker.github,
        twitter: speaker.twitter,
      })),
      rating: {
        average: ratingDetails.average,
        positives: ratingDetails.positives,
        negatives: ratingDetails.negatives,
        userRating: {
          rating: userRating?.rating,
          feeling: userRating?.feeling,
        },
        membersRatings: proposal.ratings.map((rating) => ({
          id: rating.user.id,
          name: rating.user.name,
          photoURL: rating.user.photoURL,
          rating: rating.rating,
          feeling: rating.feeling,
        })),
      },
      messages: proposal.messages.map((message) => ({
        id: message.id,
        name: message.user.name,
        photoURL: message.user.photoURL,
        message: message.message,
      })),
    },
  };
}

/**
 * Rate a proposal by a speaker
 * @param eventSlug event slug
 * @param proposalId Proposal id
 * @param uid User id
 * @param data Rating data
 */
export async function rateProposal(eventSlug: string, proposalId: string, uid: string, data: RatingData) {
  const event = await db.event.findFirst({
    where: { slug: eventSlug, organization: { members: { some: { memberId: uid } } } },
  });
  if (!event) throw new ForbiddenOperationError();

  await db.rating.upsert({
    where: { userId_proposalId: { userId: uid, proposalId } },
    update: data,
    create: { userId: uid, proposalId, ...data },
  });
}

export type RatingData = z.infer<typeof RatingDataSchema>;

const RatingDataSchema = z.object({
  rating: z.preprocess((a) => (a !== '' ? parseInt(a as string, 10) : null), z.number().min(0).max(5).nullable()),
  feeling: z.enum(['NEUTRAL', 'POSITIVE', 'NEGATIVE', 'NO_OPINION']),
});

export function validateRating(form: FormData) {
  const result = RatingDataSchema.safeParse({
    rating: form.get('rating'),
    feeling: form.get('feeling'),
  });
  if (!result.success) return null;
  return result.data;
}
