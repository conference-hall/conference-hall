import type { Prisma } from '@prisma/client';
import { EmailStatus } from '@prisma/client';
import type { Pagination } from '~/schemas/pagination';
import type { EmailStatusData, ProposalsFilters } from '~/schemas/proposal';
import { db } from '../../libs/db';
import { checkAccess } from '../organizer-event/check-access.server';
import { getPagination } from '../shared/pagination.server';
import { RatingsDetails } from './models/ratings-details';

const RESULTS_BY_PAGE = 25;

export async function searchProposals(
  orgaSlug: string,
  eventSlug: string,
  uid: string,
  filters: ProposalsFilters,
  page: Pagination = 1
) {
  await checkAccess(orgaSlug, eventSlug, uid);

  const whereClause = proposalWhereInput(eventSlug, uid, filters);
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
        emailAcceptedStatus: proposal.emailAcceptedStatus,
        emailRejectedStatus: proposal.emailRejectedStatus,
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

export function proposalWhereInput(slug: string, uid: string, filters: ProposalsFilters): Prisma.ProposalWhereInput {
  const { query, ratings, formats, categories, status, emailAcceptedStatus, emailRejectedStatus } = filters;
  const ratingClause = ratings === 'rated' ? { some: { userId: uid } } : { none: { userId: uid } };

  return {
    event: { slug },
    status: { in: status, not: 'DRAFT' },
    formats: formats ? { some: { id: formats } } : {},
    categories: categories ? { some: { id: categories } } : {},
    ratings: ratings ? ratingClause : {},
    emailAcceptedStatus: mapEmailStatus(emailAcceptedStatus),
    emailRejectedStatus: mapEmailStatus(emailRejectedStatus),
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { speakers: { some: { name: { contains: query, mode: 'insensitive' } } } },
    ],
  };
}

export function proposalOrderBy(filters: ProposalsFilters): Prisma.ProposalOrderByWithRelationInput[] {
  if (filters.sort === 'oldest') return [{ createdAt: 'asc' }, { title: 'asc' }];
  return [{ createdAt: 'desc' }, { title: 'asc' }];
}

function mapEmailStatus(emailStatus: EmailStatusData) {
  switch (emailStatus) {
    case 'sent':
      return { in: [EmailStatus.SENT, EmailStatus.DELIVERED] };
    case 'not-sent':
      return null;
    default:
      return undefined;
  }
}
