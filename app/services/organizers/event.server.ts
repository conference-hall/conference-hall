import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { OrganizationRole } from '@prisma/client';
import { MessageChannel } from '@prisma/client';
import { unstable_parseMultipartFormData } from '@remix-run/node';
import type { EventCreateData, EventTrackSaveData } from '~/schemas/event';
import type { ProposalRatingData, ProposalsFilters, ProposalStatusData, ProposalUpdateData } from '~/schemas/proposal';
import { getCfpState } from '~/utils/event';
import { jsonToArray } from '~/utils/prisma';
import { db } from '../db';
import { EventNotFoundError, ForbiddenOperationError, ProposalNotFoundError } from '../errors';
import { geocode } from '../utils/geocode.server';
import { getPagination } from '../utils/pagination.server';
import { RatingsDetails } from '../utils/ratings.server';
import { uploadToStorageHandler } from '../utils/storage.server';
import { getUserRole } from './organizations.server';
import type { Pagination } from '~/schemas/pagination';

/**
 * Check the organizer role to an event.
 * Returns the user role or throws an error when user not member or does not have the correct role.
 *
 * @param orgaSlug organization slug
 * @param eventSlug event slug
 * @param uid Id of the user to check
 * @param roles list of checked roles (all if no roles given)
 * @returns user role else throw a forbidden error
 */
export async function checkOrganizerEventAccess(
  orgaSlug: string,
  eventSlug: string,
  uid: string,
  roles?: OrganizationRole[]
) {
  if (!orgaSlug || !eventSlug) throw new ForbiddenOperationError();

  const rolesToCheck = roles || [OrganizationRole.MEMBER, OrganizationRole.REVIEWER, OrganizationRole.OWNER];

  const member = await db.organizationMember.findFirst({
    where: {
      memberId: uid,
      organization: {
        slug: orgaSlug,
        events: { some: { slug: eventSlug } },
      },
    },
  });

  if (!member || !rolesToCheck.includes(member.role)) {
    throw new ForbiddenOperationError();
  }
  return member.role;
}

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
    id: event.id,
    name: event.name,
    slug: event.slug,
    type: event.type,
    address: event.address,
    conferenceStart: event.conferenceStart?.toUTCString(),
    conferenceEnd: event.conferenceEnd?.toUTCString(),
    description: event.description,
    visibility: event.visibility,
    websiteUrl: event.websiteUrl,
    codeOfConductUrl: event.codeOfConductUrl,
    contactEmail: event.contactEmail,
    bannerUrl: event.bannerUrl,
    maxProposals: event.maxProposals,
    surveyEnabled: event.surveyEnabled,
    surveyQuestions: jsonToArray(event.surveyQuestions),
    deliberationEnabled: event.deliberationEnabled,
    displayOrganizersRatings: event.displayOrganizersRatings,
    displayProposalsRatings: event.displayProposalsRatings,
    displayProposalsSpeakers: event.displayProposalsSpeakers,
    formatsRequired: event.formatsRequired,
    categoriesRequired: event.categoriesRequired,
    emailOrganizer: event.emailOrganizer,
    emailNotifications: jsonToArray(event.emailNotifications),
    slackWebhookUrl: event.slackWebhookUrl,
    apiKey: event.apiKey,
    cfpStart: event.cfpStart?.toUTCString(),
    cfpEnd: event.cfpEnd?.toUTCString(),
    cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
    formats: event.formats.map(({ id, name, description }) => ({ id, name, description })),
    categories: event.categories.map(({ id, name, description }) => ({ id, name, description })),
  };
}

const RESULTS_BY_PAGE = 25;

/**
 * Search for event proposals
 * @param eventSlug event's slug
 * @param uid Id of the user (member of the event's organization)
 * @param filters Filters to apply to the search
 * @param page Results page number
 * @returns results of the search with filters, pagination and total results
 */
export async function searchProposals(
  orgaSlug: string,
  eventSlug: string,
  uid: string,
  filters: ProposalsFilters,
  page: Pagination = 1
) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid);

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
  const { query, ratings, formats, categories, status } = filters;
  const ratingClause = ratings === 'rated' ? { some: { userId: uid } } : { none: { userId: uid } };

  return {
    event: { slug },
    status: { in: status, not: 'DRAFT' },
    formats: formats ? { some: { id: formats } } : {},
    categories: categories ? { some: { id: categories } } : {},
    ratings: ratings ? ratingClause : {},
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { speakers: { some: { name: { contains: query, mode: 'insensitive' } } } },
    ],
  };
}

function proposalOrderBy(filters: ProposalsFilters): Prisma.ProposalOrderByWithRelationInput[] {
  if (filters.sort === 'oldest') return [{ createdAt: 'asc' }, { title: 'asc' }];
  return [{ createdAt: 'desc' }, { title: 'asc' }];
}

/**
 * Retrieve proposal informations
 * @param orgaSlug organizer slug
 * @param eventSlug event slug
 * @param proposalId Proposal id
 * @param uid User id
 * @param filters Search filters
 */
export async function getProposalReview(
  orgaSlug: string,
  eventSlug: string,
  proposalId: string,
  uid: string,
  filters: ProposalsFilters
) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid);

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
      formats: proposal.formats.map(({ id, name }) => ({ id, name })),
      categories: proposal.categories.map(({ id, name }) => ({ id, name })),
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
      messages: proposal.messages
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((message) => ({
          id: message.id,
          userId: message.userId,
          name: message.user.name,
          photoURL: message.user.photoURL,
          message: message.message,
        })),
    },
  };
}

/**
 * Rate a proposal by a speaker
 * @param orgaSlug organization slug
 * @param eventSlug event slug
 * @param proposalId Proposal id
 * @param uid User id
 * @param data Rating data
 */
export async function rateProposal(
  orgaSlug: string,
  eventSlug: string,
  proposalId: string,
  uid: string,
  data: ProposalRatingData
) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid);

  await db.rating.upsert({
    where: { userId_proposalId: { userId: uid, proposalId } },
    update: data,
    create: { userId: uid, proposalId, ...data },
  });
}

/**
 * Add an organizer comment to a proposal
 * @param orgaSlug organization slug
 * @param eventSlug event slug
 * @param proposalId Proposal id
 * @param uid User id
 * @param message User message
 */
export async function addProposalComment(
  orgaSlug: string,
  eventSlug: string,
  proposalId: string,
  uid: string,
  message: string
) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid);

  await db.message.create({
    data: { userId: uid, proposalId, message, channel: MessageChannel.ORGANIZER },
  });
}

/**
 * Remove an organizer comment to a proposal
 * @param orgaSlug organization slug
 * @param eventSlug Event slug
 * @param proposalId Proposal id
 * @param uid User id
 * @param messageId Message id
 */
export async function removeProposalComment(
  orgaSlug: string,
  eventSlug: string,
  proposalId: string,
  uid: string,
  messageId: string
) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid);

  await db.message.deleteMany({ where: { id: messageId, userId: uid, proposalId } });
}

/**
 * Update proposal data from organizer page
 * @param orgaSlug Organization slug
 * @param eventSlug Event slug
 * @param proposalId Proposal Id
 * @param uid User id
 * @param data Data to update
 */
export async function updateProposal(
  orgaSlug: string,
  eventSlug: string,
  proposalId: string,
  uid: string,
  data: ProposalUpdateData
) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER, OrganizationRole.MEMBER]);

  const { formats, categories, ...talk } = data;

  return await db.proposal.update({
    where: { id: proposalId },
    data: {
      ...talk,
      formats: { set: [], connect: formats?.map((id) => ({ id })) },
      categories: { set: [], connect: categories?.map((id) => ({ id })) },
    },
  });
}

/**
 * Create an event
 * @param orgaSlug Organization slug
 * @param uid User id
 * @param data Event data
 */
export async function createEvent(orgaSlug: string, uid: string, data: EventCreateData) {
  const role = await getUserRole(orgaSlug, uid);
  if (role !== OrganizationRole.OWNER) throw new ForbiddenOperationError();

  return await db.$transaction(async (trx) => {
    const existSlug = await trx.event.findFirst({ where: { slug: data.slug } });
    if (existSlug) {
      return { error: { fieldErrors: { slug: 'Slug already exists, please try another one.' } } };
    }

    await trx.event.create({
      data: {
        ...data,
        creator: { connect: { id: uid } },
        organization: { connect: { slug: orgaSlug } },
      },
    });
    return { slug: data.slug };
  });
}

/**
 * Update an event
 * @param orgaSlug Organization slug
 * @param eventSlug Event slug
 * @param uid User id
 * @param data event data
 */
export async function updateEvent(
  orgaSlug: string,
  eventSlug: string,
  uid: string,
  data: Partial<Prisma.EventCreateInput>
) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

  const event = await db.event.findFirst({ where: { slug: eventSlug } });
  if (!event) throw new EventNotFoundError();

  if (data.address && event?.address !== data.address) {
    const geocodedAddress = await geocode(data.address);
    data.address = geocodedAddress.address;
    data.lat = geocodedAddress.lat;
    data.lng = geocodedAddress.lng;
  }

  return await db.$transaction(async (trx) => {
    if (data.slug) {
      const existSlug = await trx.event.findFirst({ where: { slug: data.slug } });
      if (existSlug && event?.id !== existSlug.id) {
        return { error: { fieldErrors: { slug: 'Slug already exists, please try another one.' } } };
      }
    }
    const updated = await trx.event.update({ where: { slug: eventSlug }, data: { ...data } });
    return { slug: updated.slug };
  });
}

/**
 * Update an event
 * @param orgaSlug Organization slug
 * @param eventSlug Event slug
 * @param uid User id
 * @param data event data
 */
export async function uploadAndSaveEventBanner(orgaSlug: string, eventSlug: string, uid: string, request: Request) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

  const event = await db.event.findFirst({ where: { slug: eventSlug } });
  if (!event) throw new EventNotFoundError();

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadToStorageHandler({ name: 'bannerUrl', path: event.id, maxFileSize: 300_000 })
  );

  const result = z.string().url().safeParse(formData.get('bannerUrl'));
  if (result.success) {
    await db.event.update({ where: { slug: eventSlug }, data: { bannerUrl: result.data } });
  }
}

/**
 * Create or update a track format to an event
 * @param orgaSlug Organization slug
 * @param eventSlug Event slug
 * @param uid User id
 * @param data Track format data
 */
export async function saveFormat(orgaSlug: string, eventSlug: string, uid: string, data: EventTrackSaveData) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

  if (data.id) {
    await db.eventFormat.update({
      where: { id: data.id },
      data: { name: data.name, description: data.description },
    });
  } else {
    await db.eventFormat.create({
      data: { name: data.name, description: data.description, event: { connect: { slug: eventSlug } } },
    });
  }
}

/**
 * Create or update a track category to an event
 * @param orgaSlug Organization slug
 * @param eventSlug Event slug
 * @param uid User id
 * @param data Track category data
 */
export async function saveCategory(orgaSlug: string, eventSlug: string, uid: string, data: EventTrackSaveData) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

  if (data.id) {
    await db.eventCategory.update({
      where: { id: data.id },
      data: { name: data.name, description: data.description },
    });
  } else {
    await db.eventCategory.create({
      data: { name: data.name, description: data.description, event: { connect: { slug: eventSlug } } },
    });
  }
}

/**
 * Delete a track format from an event
 * @param orgaSlug Organization slug
 * @param eventSlug Event slug
 * @param uid User id
 * @param formatId Format id to remove
 */
export async function deleteFormat(orgaSlug: string, eventSlug: string, uid: string, formatId: string) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

  await db.eventFormat.delete({ where: { id: formatId } });
}

/**
 * Delete a track category from an event
 * @param orgaSlug Organization slug
 * @param eventSlug Event slug
 * @param uid User id
 * @param categoryId Category id to remove
 */
export async function deleteCategory(orgaSlug: string, eventSlug: string, uid: string, categoryId: string) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

  await db.eventCategory.delete({ where: { id: categoryId } });
}

/**
 * Update proposals status
 * @param orgaSlug Organization slug
 * @param eventSlug Event slug
 * @param uid User id
 * @param proposalIds Proposal Ids
 * @param status Status to update
 */
export async function updateProposalsStatus(
  orgaSlug: string,
  eventSlug: string,
  uid: string,
  proposalIds: string[],
  status: ProposalStatusData
) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER, OrganizationRole.MEMBER]);

  const result = await db.proposal.updateMany({ where: { id: { in: proposalIds } }, data: { status } });
  return result.count;
}

/**
 * Export proposals
 * @param orgaSlug Organization slug
 * @param eventSlug Event slug
 * @param uid User id
 * @param filters Filters criterias
 */
export async function exportProposalsFromFilters(
  orgaSlug: string,
  eventSlug: string,
  uid: string,
  filters: ProposalsFilters
) {
  await checkOrganizerEventAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER, OrganizationRole.MEMBER]);

  const whereClause = proposalWhereInput(eventSlug, uid, filters);
  const orderByClause = proposalOrderBy(filters);
  const proposals = await db.proposal.findMany({
    include: { speakers: true, ratings: true },
    where: whereClause,
    orderBy: orderByClause,
  });

  return proposals.map((proposal) => {
    const ratings = new RatingsDetails(proposal.ratings);
    return {
      id: proposal.id,
      title: proposal.title,
      status: proposal.status,
      speakers: proposal.speakers.map((speaker) => ({
        name: speaker.name,
        bio: speaker.bio,
        company: speaker.company,
      })),
      ratings: {
        positives: ratings.positives,
        negatives: ratings.negatives,
        total: ratings.average,
      },
    };
  });
}
