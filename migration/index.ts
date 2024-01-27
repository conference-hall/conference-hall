import admin from 'firebase-admin';
import { resetDB } from 'tests/db-helpers';

import { migrateTalks } from './talks';
import { migrateUsers } from './users';

const projectId = process.env.MIGRATE_FIREBASE_PROJECT_ID;
const serviceAccount = process.env.MIGRATE_FIREBASE_SERVICE_ACCOUNT;

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
}

main();
