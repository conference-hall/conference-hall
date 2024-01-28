import admin from 'firebase-admin';
import { db } from 'prisma/db.server';

import { migrateTalks } from './talks';
import { migrateTeams } from './teams';
import { migrateUsers } from './users';

const projectId = process.env.MIGRATE_FIREBASE_PROJECT_ID;
const serviceAccount = process.env.MIGRATE_FIREBASE_SERVICE_ACCOUNT;

async function main() {
  console.log('Connect to firestore...');
  const firestore = initFirestore();
  if (!firestore) return;

  console.log('Reset database...');
  await resetDB();

  console.log('Migrating users...');
  await migrateUsers(firestore);

  console.log('Migrating talks...');
  await migrateTalks(firestore);

  console.log('Migrating teams...');
  await migrateTeams(firestore);
}

function initFirestore() {
  if (!serviceAccount || !projectId) {
    console.log('Missing MIGRATE_FIREBASE_SERVICE_ACCOUNT or MIGRATE_FIREBASE_PROJECT_ID');
    return;
  }

  const app = admin.initializeApp({
    projectId: projectId,
    credential: admin.credential.cert(JSON.parse(serviceAccount)),
  });

  return app.firestore();
}

export async function resetDB() {
  await db.$transaction([
    db.survey.deleteMany(),
    db.comment.deleteMany(),
    db.review.deleteMany(),
    db.proposal.deleteMany(),
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
