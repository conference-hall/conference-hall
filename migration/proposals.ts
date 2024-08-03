import type { Prisma } from '@prisma/client';
import {
  CommentChannel,
  ConfirmationStatus,
  DeliberationStatus,
  PublicationStatus,
  ReviewFeeling,
} from '@prisma/client';
import type admin from 'firebase-admin';
import { db } from 'prisma/db.server.ts';
import ProgressBar from 'progress';

import { arrayFromBooleanMap, findUser, findUsers, mapLanguage, mapLevel } from './utils.ts';

// Memoize users
const memoizedUsers = new Map<string, string>();

const proposalsWithoutTitle = [];
const proposalsWithoutAbstract = [];
const proposalsWithoutSpeakers = [];
let totalWithoutTalks = 0;

/**
 * Migrate Proposals, comments and reviews
 */
export async function migrateProposals(firestore: admin.firestore.Firestore) {
  const events = await db.event.findMany({ include: { formats: true, categories: true } });
  const eventProgress = new ProgressBar('  Proposals [:percent] - Elapsed: :elapseds - ETA: :etas (:rate/s) [:bar]', {
    total: events.length,
  });

  let proposalsMigratedCount = 0;

  for (const event of events) {
    eventProgress.tick();

    if (!event.migrationId) {
      console.log(` > Event migrationId not found for event: ${event.name}`);
      continue;
    }

    const proposals = (await firestore.collection('events').doc(event.migrationId).collection('proposals').get()).docs;

    for (const proposalDoc of proposals) {
      const data = proposalDoc.data();

      const speakersIds = await findUsers(arrayFromBooleanMap(data.speakers), memoizedUsers);
      const talk = await findTalk(event.id, proposalDoc.id);

      // get formats
      const formats = data.formats ? event.formats.filter((format) => format.migrationId === data.formats) : undefined;
      // get categories
      const categories = data.categories
        ? event.categories.filter((category) => category.migrationId === data.categories)
        : undefined;

      // get comments
      const commentDocs = (
        await firestore
          .collection('events')
          .doc(event.migrationId)
          .collection('proposals')
          .doc(proposalDoc.id)
          .collection('organizersThread')
          .get()
      ).docs;

      const comments = (
        await Promise.all(
          commentDocs.map(async (doc) => {
            const comment = doc.data();
            const userId = await findUser(comment.uid, memoizedUsers);
            if (!userId) return undefined;
            return {
              migrationId: doc.id,
              comment: comment.message,
              userId: userId,
              channel: CommentChannel.ORGANIZER,
              createdAt: comment.date?.toDate(),
              updatedAt: comment.date?.toDate(),
            };
          }),
        )
      ).filter(Boolean) as Prisma.CommentCreateManyProposalInput[];

      // get reviews
      const reviewDocs = (
        await firestore
          .collection('events')
          .doc(event.migrationId)
          .collection('proposals')
          .doc(proposalDoc.id)
          .collection('ratings')
          .get()
      ).docs;

      const reviews = (
        await Promise.all(
          reviewDocs.map(async (doc) => {
            const review = doc.data();
            const userId = await findUser(review.uid, memoizedUsers);
            if (!userId) return undefined;
            return {
              migrationId: doc.id,
              feeling: mapFeelings(review.feeling),
              note: review.rating >= 0 ? review.rating : undefined,
              userId: userId,
              createdAt: review.updateTimestamp?.toDate(),
              updatedAt: review.updateTimestamp?.toDate(),
            };
          }),
        )
      ).filter(Boolean) as Prisma.ReviewCreateManyProposalInput[];

      const proposal: Prisma.ProposalCreateInput = {
        migrationId: proposalDoc.id,
        title: data.title,
        abstract: data.abstract,
        references: data.references,
        level: mapLevel(data.level),
        languages: mapLanguage(data.language),
        event: { connect: { id: event.id } },
        talk: talk ? { connect: { id: talk.id } } : undefined,
        speakers: { connect: speakersIds.map((id) => ({ id })) },
        createdAt: data.createTimestamp?.toDate(),
        updatedAt: data.updateTimestamp?.toDate(),
        avgRateForSort: data.rating,
        isDraft: false,
        confirmationStatus: mapConfirmationStatus(data.state, data.emailStatus), // CONFIRMED, DECLINED, PENDING // state = confirmed or declined
        deliberationStatus: mapDeliberationStatus(data.state), // ACCEPTED, REJECTED, PENDING // state = accepted or rejected
        publicationStatus: mapPublicationStatus(data.emailStatus), // PUBLISHED, NOT_PUBLISHED // emailStatus = sent
        formats: formats ? { connect: formats.map((id) => id) } : undefined,
        categories: categories ? { connect: categories.map((id) => id) } : undefined,
        reviews: { createMany: { data: reviews } },
        comments: { createMany: { data: comments } },
      };

      if (!talk?.id) {
        totalWithoutTalks += 1;
      }

      if (!proposal.title) {
        proposalsWithoutTitle.push(proposal.migrationId);
        continue;
      }

      if (!proposal.abstract) {
        proposalsWithoutAbstract.push(proposal.migrationId);
        continue;
      }

      if (speakersIds.length === 0) {
        proposalsWithoutSpeakers.push(proposal.migrationId);
        continue;
      }

      await db.proposal.create({ data: proposal });
      proposalsMigratedCount++;
    }
  }

  console.log(` > Proposals without title: ${proposalsWithoutTitle.length}`);
  console.log(` > Proposals without abstract: ${proposalsWithoutAbstract.length}`);
  console.log(` > Proposals without speakers: ${proposalsWithoutSpeakers.length}`);
  console.log(' > Proposals without talk', totalWithoutTalks);
  console.log(` > Proposals migrated ${proposalsMigratedCount}`);
}

function mapConfirmationStatus(status: string, emailStatus: string): ConfirmationStatus | null {
  switch (status) {
    case 'confirmed':
      return ConfirmationStatus.CONFIRMED;
    case 'declined':
      return ConfirmationStatus.DECLINED;
    case 'accepted':
      return emailStatus ? ConfirmationStatus.PENDING : null;
    default:
      return null;
  }
}

function mapDeliberationStatus(status: string): DeliberationStatus {
  switch (status) {
    case 'accepted':
    case 'confirmed':
    case 'declined':
      return DeliberationStatus.ACCEPTED;
    case 'rejected':
      return DeliberationStatus.REJECTED;
    default:
      return DeliberationStatus.PENDING;
  }
}

function mapPublicationStatus(emailStatus: string): PublicationStatus {
  switch (emailStatus) {
    case 'sent':
    case 'sending':
    case 'delivered':
      return PublicationStatus.PUBLISHED;
    default:
      return PublicationStatus.NOT_PUBLISHED;
  }
}

function mapFeelings(feeling: string): ReviewFeeling {
  switch (feeling) {
    case 'love':
      return ReviewFeeling.POSITIVE;
    case 'hate':
      return ReviewFeeling.NEGATIVE;
    case 'noopinion':
      return ReviewFeeling.NO_OPINION;
    default:
      return ReviewFeeling.NEUTRAL;
  }
}

async function findTalk(eventId: string, proposalId: string) {
  const talk = await db.talk.findFirst({ where: { migrationId: proposalId } });

  if (talk) {
    const already = await alreadySubmittedTalk(eventId, talk.id);
    if (already) {
      console.log(`Link already exists for ${proposalId}: ${eventId}/${talk.id} with proposal ${already.id}`);
      return null;
    }
    return talk;
  }

  return null;
}

async function alreadySubmittedTalk(eventId: string, talkId: string) {
  const proposal = await db.proposal.findUnique({ where: { talkId_eventId: { talkId, eventId } } });
  return proposal;
}
