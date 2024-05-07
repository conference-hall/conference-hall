import type { Prisma } from '@prisma/client';
import type admin from 'firebase-admin';
import { db } from 'prisma/db.server';
import ProgressBar from 'progress';

import { arrayFromBooleanMap, findUser, findUsers, mapBoolean, mapLanguage, mapLevel } from './utils';

// Memoize users
const memoizedUsers = new Map<string, string>();

const talksWithoutTitle = [];
const talksWithoutAbstract = [];
const talksWithoutCreator = [];
const talksWithoutSpeakers = [];

/**
 * Migrate Talks
 */
export async function migrateTalks(firestore: admin.firestore.Firestore) {
  const talks = (await firestore.collection('talks').get()).docs;
  const talkProgress = new ProgressBar('  Talks      [:percent] - Elapsed: :elapseds - ETA: :etas (:rate/s) [:bar]', {
    total: talks.length,
  });

  for (const talkDoc of talks) {
    const data = talkDoc.data();
    talkProgress.tick();

    const speakersIds = await findUsers(arrayFromBooleanMap(data.speakers), memoizedUsers);
    const creatorId = (await findUser(data.owner, memoizedUsers)) || speakersIds[0];

    const talk: Prisma.TalkCreateInput = {
      migrationId: talkDoc.id,
      title: data.title, // talks without title
      abstract: data.abstract, // talks without abstract
      references: data.references,
      level: mapLevel(data.level),
      languages: mapLanguage(data.language),
      archived: mapBoolean(data.archived),
      creator: { connect: { id: creatorId } }, // talks without creator
      speakers: { connect: speakersIds.map((id) => ({ id })) },
      createdAt: data.updateTimestamp?.toDate(),
      updatedAt: data.updateTimestamp?.toDate(),
    };

    if (!talk.title) {
      talksWithoutTitle.push(talk.migrationId);
      continue;
    } else if (!talk.abstract) {
      talksWithoutAbstract.push(talk.migrationId);
      continue;
    } else if (!creatorId) {
      talksWithoutCreator.push(talk.migrationId);
      continue;
    } else if (speakersIds.length === 0) {
      talksWithoutSpeakers.push(talk.migrationId);
      continue;
    }

    await db.talk.create({ data: talk });
  }

  const talksMigratedCount =
    talks.length -
    talksWithoutTitle.length -
    talksWithoutAbstract.length -
    talksWithoutCreator.length -
    talksWithoutSpeakers.length;

  console.log(` > Talks without title: ${talksWithoutTitle.length}`);
  console.log(` > Talks without abstract: ${talksWithoutAbstract.length}`);
  console.log(` > Talks without creator: ${talksWithoutCreator.length}`);
  console.log(` > Talks without speakers: ${talksWithoutSpeakers.length}`);
  console.log(` > Talks migrated ${talksMigratedCount}`);
}
