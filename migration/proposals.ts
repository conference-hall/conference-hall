import type { Prisma } from '@prisma/client';
import {
  CommentChannel,
  ConfirmationStatus,
  DeliberationStatus,
  PublicationStatus,
  ReviewFeeling,
} from '@prisma/client';
import type admin from 'firebase-admin';
import { db } from 'prisma/db.server';
import ProgressBar from 'progress';

import { arrayFromBooleanMap, findUser, findUsers, mapLanguage, mapLevel } from './utils';

// Memoize users
const memoizedUsers = new Map<string, string>();

const proposalsWithoutTitle = [];
const proposalsWithoutAbstract = [];
const proposalsWithoutSpeakers = [];

/**
 * Migrate Proposals, comments and reviews
 */
export async function migrateProposals(firestore: admin.firestore.Firestore) {
  const events = await db.event.findMany({ include: { formats: true, categories: true } });
  const eventProgress = new ProgressBar('  Proposals [:percent] - Elapsed: :elapseds - ETA: :etas (:rate/s) [:bar]', {
    total: events.length,
  });

  let proposalsMigratedCount = 1;

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
      const talk = data.talk ? await db.talk.findFirst({ where: { migrationId: proposalDoc.id } }) : undefined;

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
        confirmationStatus: mapConfirmationStatus(data.state), // CONFIRMED, DECLINED, PENDING // state = confirmed or declined
        deliberationStatus: mapDeliberationStatus(data.state), // ACCEPTED, REJECTED, PENDING // state = accepted or rejected
        publicationStatus: mapPublicationStatus(data.emailStatus), // PUBLISHED, NOT_PUBLISHED // emailStatus = sent
        formats: formats ? { connect: formats.map((id) => id) } : undefined,
        categories: categories ? { connect: categories.map((id) => id) } : undefined,
        reviews: { createMany: { data: reviews } },
        comments: { createMany: { data: comments } },
      };

      if (!proposal.title) {
        proposalsWithoutTitle.push(proposal.migrationId);
        continue;
      } else if (!proposal.abstract) {
        proposalsWithoutAbstract.push(proposal.migrationId);
        continue;
      } else if (speakersIds.length === 0) {
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
  console.log(` > Proposals migrated ${proposalsMigratedCount}`);
}

function mapConfirmationStatus(status: string): ConfirmationStatus {
  switch (status) {
    case 'confirmed':
      return ConfirmationStatus.CONFIRMED;
    case 'declined':
      return ConfirmationStatus.DECLINED;
    default:
      return ConfirmationStatus.PENDING;
  }
}

function mapDeliberationStatus(status: string): DeliberationStatus {
  switch (status) {
    case 'accepted':
      return DeliberationStatus.ACCEPTED;
    case 'rejected':
      return DeliberationStatus.REJECTED;
    default:
      return DeliberationStatus.PENDING;
  }
}

function mapPublicationStatus(status: string): PublicationStatus {
  switch (status) {
    case 'sent':
      return PublicationStatus.PUBLISHED;
    default:
      return PublicationStatus.NOT_PUBLISHED;
  }
}

function mapFeelings(feeling: string): ReviewFeeling {
  switch (feeling) {
    case 'love':
      return ReviewFeeling.NEGATIVE;
    case 'hate':
      return ReviewFeeling.POSITIVE;
    case 'noopinion':
      return ReviewFeeling.NO_OPINION;
    default:
      return ReviewFeeling.NEUTRAL;
  }
}
