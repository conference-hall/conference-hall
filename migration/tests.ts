import admin from 'firebase-admin';
import { db } from 'prisma/db.server.ts';

const projectId = process.env.MIGRATE_FIREBASE_PROJECT_ID;
const serviceAccount = process.env.MIGRATE_FIREBASE_SERVICE_ACCOUNT;

async function main() {
  console.log('Connect to firestore...');
  const { firestore } = initFirestore();
  if (!firestore) return;

  console.log('>> POSTGRESQL');
  await talksInDb();

  console.log('>> FIRESTORE');
  await talksInFirestore(firestore);
}

async function talksInDb() {
  const talks = await db.talk.findMany({ include: { proposals: true } });

  const talksCount = talks.length;
  const talksWithProposalsCount = talks.reduce((acc, next) => acc + next.proposals.length, 0);

  console.log('Talks:', talksCount);
  console.log('Talks with proposals:', talksWithProposalsCount);

  const proposalsCount = await db.proposal.count();
  console.log('Proposals:', proposalsCount);
  console.log('Proposals without talk:', proposalsCount - talksWithProposalsCount);
}

async function talksInFirestore(firestore: admin.firestore.Firestore) {
  const talks = (await firestore.collection('talks').get()).docs;

  const talksCount = talks.length;
  const talksWithProposalsCount = talks.reduce((acc, next) => {
    const data = next.data();
    if (!data.submissions) return acc;
    return Object.keys(data.submissions).length + acc;
  }, 0);

  console.log('Talks:', talksCount);
  console.log('Talks with proposals:', talksWithProposalsCount);

  const proposalsCount = await db.proposal.count();
  console.log('Proposals:', proposalsCount);
  console.log('Proposals without talk:', proposalsCount - talksWithProposalsCount);
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

  const firestore = app.firestore();

  return { firestore };
}

main();
