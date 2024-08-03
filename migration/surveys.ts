import type admin from 'firebase-admin';
import { db } from 'prisma/db.server.ts';
import ProgressBar from 'progress';

import { findUser } from './utils.ts';

// Memoize users
const memoizedUsers = new Map<string, string>();

const surveyWithoutUser = [];

/**
 * Migrate Surveys
 */
export async function migrateSurveys(firestore: admin.firestore.Firestore) {
  const events = await db.event.findMany();
  const eventProgress = new ProgressBar('  Surveys   [:percent] - Elapsed: :elapseds - ETA: :etas (:rate/s) [:bar]', {
    total: events.length,
  });

  for (const event of events) {
    eventProgress.tick();

    if (!event.migrationId) {
      console.log(` > Event migrationId not found for event: ${event.name}`);
      continue;
    }

    const surveys = (await firestore.collection('events').doc(event.migrationId).collection('surveys').get()).docs;

    for (const surveyDoc of surveys) {
      const data = surveyDoc.data();

      const userId = await findUser(data.uid, memoizedUsers);
      if (!userId) {
        surveyWithoutUser.push({ event: event.migrationId, survey: surveyDoc.id, uid: data.uid });
        continue;
      }

      await db.survey.create({
        data: {
          migrationId: surveyDoc.id,
          eventId: event.id,
          userId: userId,
          answers: {
            gender: data.gender, // male, female, genderless
            tshirt: data.tshirt, // S, M, L, XL, XXL, XXXL
            accomodation: data.accomodation, // yes, no
            transports: mapMultiValues(data.transports), // plane, taxi, train
            diet: mapMultiValues(data.diet), // vegan, vegetarian, gluten-free, halal, nut-allergy
            info: data.info, // string
          },
          createdAt: data.updateTimestamp?.toDate(),
          updatedAt: data.updateTimestamp?.toDate(),
        },
      });
    }
  }

  console.log(` > Surveys without user: ${surveyWithoutUser.length}`);
}

function mapMultiValues(values: Record<string, string[]>) {
  if (!values) return undefined;
  try {
    return Object.values(values)
      .filter(Boolean)
      .reduce((acc, value) => acc.concat(value), []);
  } catch (error) {
    return undefined;
  }
}
