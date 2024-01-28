import type { Prisma } from '@prisma/client';
import type admin from 'firebase-admin';
import { db } from 'prisma/db.server';

import { arrayFromBooleanMap, findUser, findUsers, logRecord, mapBoolean, mapLanguage, mapLevel } from './utils';

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

  let index = 1;
  for (const talkDoc of talks) {
    const data = talkDoc.data();

    logRecord('Talk', index++, talks.length, data.title);

    const speakersIds = await findUsers(arrayFromBooleanMap(data.speakers), memoizedUsers);
    const creatorId = (await findUser(data.owner, memoizedUsers)) || speakersIds[0];

    const talk: Prisma.TalkCreateInput = {
      migrationId: talkDoc.id,
      title: data.title,
      abstract: data.abstract,
      references: data.references,
      level: mapLevel(data.level),
      languages: mapLanguage(data.language),
      archived: mapBoolean(data.archived),
      creator: { connect: { id: creatorId } },
      speakers: { connect: speakersIds.map((id) => ({ id })) },
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

  console.log(`Talks without title: ${talksWithoutTitle.length}`);
  console.log(`Talks without abstract: ${talksWithoutAbstract.length}`);
  console.log(`Talks without creator: ${talksWithoutCreator.length}`);
  console.log(`Talks without speakers: ${talksWithoutSpeakers.length}`);
  console.log(`Talks migrated ${talksMigratedCount}`);
}
