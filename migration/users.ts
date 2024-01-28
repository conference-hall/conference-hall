import type { Prisma } from '@prisma/client';
import type admin from 'firebase-admin';
import { db } from 'prisma/db.server';

import { logRecord } from './utils';

const usersWithoutEmail = [];

/**
 * Migrate Users, Organization Keys, and Accounts
 */
export async function migrateUsers(firestore: admin.firestore.Firestore) {
  const users = (await firestore.collection('users').get()).docs;

  let index = 1;
  for (const userDoc of users) {
    const data = userDoc.data();

    logRecord('User', index++, users.length, data.email);

    const user: Prisma.UserCreateInput = {
      migrationId: userDoc.id,
      name: data.displayName,
      email: data.email, // TODO: Test with email unique constraint
      picture: data.photoURL,
      bio: data.bio,
      company: data.company,
      references: data.speakerReferences,
      address: data.address?.formattedAddress,
      socials: { twitter: data.twitter, github: data.github }, // TODO: extract only username and compact
      organizerKeyAccess: data.betaAccess
        ? { connectOrCreate: { create: { id: data.betaAccess }, where: { id: data.betaAccess } } }
        : undefined,
      accounts: {
        create: {
          uid: userDoc.id,
          name: data.displayName,
          email: data.email,
          picture: data.photoURL,
          provider: 'unknown', // TODO: get provider from auth?
        },
      },
    };

    if (!user.email) {
      usersWithoutEmail.push(user.migrationId);
      continue;
    }

    await db.user.create({ data: user });
  }

  console.log(`Users without emails: ${usersWithoutEmail.length}`);
  console.log(`User migrated ${users.length - usersWithoutEmail.length}`);
}
