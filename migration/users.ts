import type { Prisma } from '@prisma/client';
import type admin from 'firebase-admin';
import type { UserRecord } from 'firebase-admin/auth';
import { db } from 'prisma/db.server.ts';
import ProgressBar from 'progress';

import { convertSocials } from './utils.ts';

const usersWithoutEmail: Array<void | UserRecord> = [];
const usersAuthNotFound: Array<string> = [];

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

    const userAuth = await auth.getUser(userDoc.id).catch(() => {
      usersAuthNotFound.push(userDoc.id);
    });

    if (!userAuth) {
      continue;
    }

    const provider = userAuth?.providerData?.[0]?.providerId || 'unknown';
    const email = getEmail(userDoc.id, data.email, userAuth?.email);
    const name = data.displayName || userAuth?.displayName || 'noname';
    const picture = data.photoURL || userAuth?.photoURL;

    const user: Prisma.UserCreateInput = {
      migrationId: userDoc.id,
      name, // TODO: Make name not null with default value (with default value 'no name' for example)
      // TODO: Check if all user emails are unique (and not null values)
      email,
      picture,
      bio: data.bio,
      company: data.company,
      references: data.speakerReferences,
      address: data.address?.formattedAddress,
      socials: convertSocials(data.twitter, data.github),
      organizerKeyAccess: data.betaAccess
        ? { connectOrCreate: { create: { id: data.betaAccess }, where: { id: data.betaAccess } } }
        : undefined,
      accounts: {
        create: {
          uid: userDoc.id,
          name,
          email,
          picture,
          provider,
          createdAt: data.createTimestamp?.toDate(),
          updatedAt: data.updateTimestamp?.toDate(),
        },
      },
      createdAt: data.createTimestamp?.toDate(),
      updatedAt: data.updateTimestamp?.toDate(),
    };

    if (!user.email) {
      usersWithoutEmail.push(userAuth);
      continue;
    }

    await db.user.create({ data: user });
  }

  console.log(` > Users auth not found: ${usersAuthNotFound}`);
  console.log(` > Users without emails: ${usersWithoutEmail.length}`);
  for (const user of usersWithoutEmail) {
    const u = user as UserRecord;
    console.log(`   - ${u.uid}, ${u.email}, ${u.providerData[0].providerId}`);
  }
  console.log(` > User migrated ${users.length - usersWithoutEmail.length}`);
}

function getEmail(uid: string, email: string, authEmail?: string) {
  if (authEmail && authEmail.includes('@')) return authEmail;
  if (email && email.includes('@')) return email;
  return `${uid}@example.com`;
}
