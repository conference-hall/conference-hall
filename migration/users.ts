import type { Prisma } from '@prisma/client';
import type admin from 'firebase-admin';
import type { UserRecord } from 'firebase-admin/auth';
import { db } from 'prisma/db.server.ts';
import ProgressBar from 'progress';

import { convertSocials } from './utils.ts';

// biome-ignore lint/suspicious/noConfusingVoidType: for migration
const usersWithoutEmail: Array<void | UserRecord> = [];
const usersAuthNotFound: Array<any> = [];

/**
 * Migrate Users, Organization Keys, and Accounts
 */
export async function migrateUsers(firestore: admin.firestore.Firestore, auth: admin.auth.Auth) {
  const users = (await firestore.collection('users').get()).docs;
  const userProgress = new ProgressBar('  Users      [:percent] - Elapsed: :elapseds - ETA: :etas (:rate/s) [:bar]', {
    total: users.length,
  });

  for (const userDoc of users) {
    const data = userDoc.data();
    userProgress.tick();

    const userAuth = await auth.getUser(userDoc.id).catch((error) => {
      console.log(error.message);
      usersAuthNotFound.push(data);
    });

    const provider = userAuth?.providerData?.[0]?.providerId || 'unknown';
    const email = getEmail(userDoc.id, data.email, userAuth?.email);
    const name = data.displayName || userAuth?.displayName || '(No name)';
    const picture = data.photoURL || userAuth?.photoURL;

    const user: Prisma.UserCreateInput = {
      migrationId: userDoc.id,
      name,
      email,
      termsAccepted: true,
      emailVerified: userAuth?.emailVerified && !email.includes('@example.com'),
      picture,
      bio: data.bio,
      company: data.company,
      references: data.speakerReferences,
      location: data.address?.formattedAddress,
      socials: convertSocials(data.twitter, data.github),
      organizerKeyAccess: data.betaAccess
        ? { connectOrCreate: { create: { id: data.betaAccess }, where: { id: data.betaAccess } } }
        : undefined,
      authenticationMethods: userAuth
        ? {
            create: {
              uid: userDoc.id,
              name,
              email,
              picture,
              provider,
              createdAt: data.createTimestamp?.toDate(),
              updatedAt: data.updateTimestamp?.toDate(),
            },
          }
        : undefined,
      createdAt: data.createTimestamp?.toDate(),
      updatedAt: data.updateTimestamp?.toDate(),
    };

    if (!user.email) {
      usersWithoutEmail.push(userAuth);
      continue;
    }

    await db.user.create({ data: user });
  }

  console.log(` > Users auth not found: ${usersAuthNotFound.length}`);
  for (const user of usersAuthNotFound) {
    console.log(`   - ${user.uid}, ${user.email}`);
  }
  console.log(` > Users without emails: ${usersWithoutEmail.length}`);
  for (const user of usersWithoutEmail) {
    const u = user as UserRecord;
    console.log(`   - ${u.uid}, ${u.email}, ${u.providerData[0].providerId}`);
  }
  console.log(` > User migrated ${users.length - usersWithoutEmail.length} / ${users.length}`);
}

function getEmail(uid: string, email: string, authEmail?: string) {
  if (authEmail?.includes('@')) return authEmail;
  if (email?.includes('@')) return email;
  return `${uid}@example.com`;
}
