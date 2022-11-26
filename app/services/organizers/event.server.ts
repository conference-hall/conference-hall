import { z } from 'zod';
import { OrganizationRole } from '@prisma/client';
import { MessageChannel } from '@prisma/client';
import { unstable_parseMultipartFormData } from '@remix-run/node';
import type { EventTrackSaveData } from '~/schemas/event';
import type { ProposalRatingData, ProposalsFilters, ProposalStatusData, ProposalUpdateData } from '~/schemas/proposal';
import { jsonToArray } from '~/utils/prisma';
import { db } from '../db';
import { EventNotFoundError, ProposalNotFoundError } from '../errors';
import { RatingsDetails } from '../utils/ratings.server';
import { uploadToStorageHandler } from '../utils/storage.server';
import { checkAccess } from '../organizer-event/check-access.server';
import { proposalOrderBy, proposalWhereInput } from '../organizer-review/search-proposals.server';

export async function getProposalReview(
  orgaSlug: string,
  eventSlug: string,
  proposalId: string,
  uid: string,
  filters: ProposalsFilters
) {
  await checkAccess(orgaSlug, eventSlug, uid);

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

export async function rateProposal(
  orgaSlug: string,
  eventSlug: string,
  proposalId: string,
  uid: string,
  data: ProposalRatingData
) {
  await checkAccess(orgaSlug, eventSlug, uid);

  await db.rating.upsert({
    where: { userId_proposalId: { userId: uid, proposalId } },
    update: data,
    create: { userId: uid, proposalId, ...data },
  });
}

export async function addProposalComment(
  orgaSlug: string,
  eventSlug: string,
  proposalId: string,
  uid: string,
  message: string
) {
  await checkAccess(orgaSlug, eventSlug, uid);

  await db.message.create({
    data: { userId: uid, proposalId, message, channel: MessageChannel.ORGANIZER },
  });
}

export async function removeProposalComment(
  orgaSlug: string,
  eventSlug: string,
  proposalId: string,
  uid: string,
  messageId: string
) {
  await checkAccess(orgaSlug, eventSlug, uid);

  await db.message.deleteMany({ where: { id: messageId, userId: uid, proposalId } });
}

export async function updateProposal(
  orgaSlug: string,
  eventSlug: string,
  proposalId: string,
  uid: string,
  data: ProposalUpdateData
) {
  await checkAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER, OrganizationRole.MEMBER]);

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

export async function uploadAndSaveEventBanner(orgaSlug: string, eventSlug: string, uid: string, request: Request) {
  await checkAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

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

export async function saveFormat(orgaSlug: string, eventSlug: string, uid: string, data: EventTrackSaveData) {
  await checkAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

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

export async function saveCategory(orgaSlug: string, eventSlug: string, uid: string, data: EventTrackSaveData) {
  await checkAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

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

export async function deleteFormat(orgaSlug: string, eventSlug: string, uid: string, formatId: string) {
  await checkAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

  await db.eventFormat.delete({ where: { id: formatId } });
}

export async function deleteCategory(orgaSlug: string, eventSlug: string, uid: string, categoryId: string) {
  await checkAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

  await db.eventCategory.delete({ where: { id: categoryId } });
}

export async function updateProposalsStatus(
  orgaSlug: string,
  eventSlug: string,
  uid: string,
  proposalIds: string[],
  status: ProposalStatusData
) {
  await checkAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER, OrganizationRole.MEMBER]);

  const result = await db.proposal.updateMany({ where: { id: { in: proposalIds } }, data: { status } });
  return result.count;
}

export async function exportProposalsFromFilters(
  orgaSlug: string,
  eventSlug: string,
  uid: string,
  filters: ProposalsFilters
) {
  await checkAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER, OrganizationRole.MEMBER]);

  const whereClause = proposalWhereInput(eventSlug, uid, filters);
  const orderByClause = proposalOrderBy(filters);
  const proposals = await db.proposal.findMany({
    include: { speakers: true, ratings: true, categories: true, formats: true },
    where: whereClause,
    orderBy: orderByClause,
  });

  return proposals.map((proposal) => {
    const ratings = new RatingsDetails(proposal.ratings);
    return {
      id: proposal.id,
      title: proposal.title,
      abstract: proposal.abstract,
      status: proposal.status,
      level: proposal.level,
      comments: proposal.comments,
      references: proposal.references,
      formats: proposal.formats,
      categories: proposal.categories,
      languages: proposal.languages,
      speakers: proposal.speakers.map((speaker) => ({
        name: speaker.name,
        bio: speaker.bio,
        company: speaker.company,
        references: speaker.references,
        photoURL: speaker.photoURL,
        github: speaker.github,
        twitter: speaker.twitter,
        address: speaker.address,
        email: speaker.email,
      })),
      ratings: {
        positives: ratings.positives,
        negatives: ratings.negatives,
        total: ratings.average,
      },
    };
  });
}
