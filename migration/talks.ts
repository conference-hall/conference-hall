import type admin from 'firebase-admin';

import { logRecord } from './utils';

/**
 * Migrate Talks
 */
export async function migrateTalks(firestore: admin.firestore.Firestore) {
  const talksRef = await firestore.collection('talks').get();

  const talks = await talksRef.docs.map((talkDoc) => {
    const talk = talkDoc.data();
    // console.log(talk.id);
    return { id: talkDoc.id, title: talk.title };
  });

  let index = 1;
  for (const talk of talks) {
    logRecord('Talk', index++, talks.length, talk.id);
  }
}
