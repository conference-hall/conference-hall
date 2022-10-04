import type { ProfileUpdateData } from '~/schemas/profile';
import { db } from '../db';
import { UserNotFoundError } from '../errors';

/**
 * Get a user settings
 * @param userId Id of the user
 * @returns UserSettings
 */
export async function getProfile(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { _count: { select: { organizations: true } } },
  });
  if (!user) throw new UserNotFoundError();
  return {
    name: user.name,
    email: user.email,
    photoURL: user.photoURL,
    bio: user.bio,
    references: user.references,
    company: user.company,
    address: user.address,
    twitter: user.twitter,
    github: user.github,
    organizationsCount: user._count.organizations,
  };
}

/**
 * Update a user settings
 * @param userId Id of the user
 * @param data Settings data
 */
export async function updateSettings(userId: string, data: ProfileUpdateData) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new UserNotFoundError();

  await db.user.update({ where: { id: userId }, data });
}
