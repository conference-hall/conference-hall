import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { db } from 'prisma/db.server.ts';

import { migrateEvents } from './event.ts';
import { migrateProposals } from './proposals.ts';
import { migrateSurveys } from './surveys.ts';
import { migrateTalks } from './talks.ts';
import { migrateTeams } from './teams.ts';
import { migrateUsers } from './users.ts';

const projectId = process.env.MIGRATE_FIREBASE_PROJECT_ID;
const serviceAccount = process.env.MIGRATE_FIREBASE_SERVICE_ACCOUNT;

async function main() {
  console.log('Connect to firestore...');
  const { auth, firestore } = initFirestore();
  if (!firestore || !auth) return;

  console.log('Reset database...');
  await resetDB();

  console.log('Migrating users...');
  await migrateUsers(firestore, auth);

  console.log('Migrating talks...');
  await migrateTalks(firestore);

  console.log('Migrating teams...');
  await migrateTeams(firestore);

  console.log('Migrating events...');
  await migrateEvents(firestore);

  console.log('Migrate surveys...');
  await migrateSurveys(firestore);

  console.log('Migrate proposals...');
  await migrateProposals(firestore);
}

function initFirestore() {
  if (!serviceAccount || !projectId) {
    console.log('Missing MIGRATE_FIREBASE_SERVICE_ACCOUNT or MIGRATE_FIREBASE_PROJECT_ID');
    return {};
  }

  const app = admin.initializeApp({
    projectId: projectId,
    credential: admin.credential.cert(JSON.parse(serviceAccount)),
  });

  const auth = getAuth(app);
  const firestore = app.firestore();

  return { auth, firestore };
}

export async function resetDB() {
  await db.$transaction([
    db.comment.deleteMany(),
    db.review.deleteMany(),
    db.proposal.deleteMany(),
    db.survey.deleteMany(),
    db.talk.deleteMany(),
    db.eventFormat.deleteMany(),
    db.eventCategory.deleteMany(),
    db.event.deleteMany(),
    db.teamMember.deleteMany(),
    db.team.deleteMany(),
    db.organizerKeyAccess.deleteMany(),
    db.user.deleteMany(),
  ]);
}

main();
