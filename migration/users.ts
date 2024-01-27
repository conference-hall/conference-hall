import type { Prisma } from '@prisma/client';
import type admin from 'firebase-admin';
import { db } from 'prisma/db.server';

import { logRecord } from './utils';

/**
 * Migrate Users, Organization Keys, and Accounts
 */
export async function migrateUsers(firestore: admin.firestore.Firestore) {
  const usersRef = await firestore.collection('users').get();

  const users = await usersRef.docs.map<Prisma.UserCreateInput>((userDoc) => {
    const user = userDoc.data();
    return {
      name: user.displayName,
      email: user.email,
      picture: user.photoURL,
      bio: user.bio,
      company: user.company,
      references: user.speakerReferences,
      address: user.address?.formattedAddress,
      socials: { twitter: user.twitter, github: user.github }, // TODO: extract only username and compact
      organizerKeyAccess: user.betaAccess
        ? { connectOrCreate: { create: { id: user.betaAccess }, where: { id: user.betaAccess } } }
        : undefined,
      accounts: {
        create: {
          uid: userDoc.id,
          name: user.displayName,
          email: user.email,
          picture: user.photoURL,
          provider: 'unknown', // TODO: get provider from auth?
        },
      },
    };
  });

  let index = 1;
  for (const user of users) {
    logRecord('User', index++, users.length, user.email);
    await db.user.create({ data: user });
  }
}
