import type { UserCreateInput } from '~/schemas/user';
import { db } from '../db';
import { UserNotFoundError } from '../errors';

/**
 * Create a new user
 * @param input Input data to create a user
 * @returns The created user id
 */
export async function createUser(input: UserCreateInput) {
  const { uid, name, email, picture } = input;
  const user = await db.user.findUnique({ where: { id: uid } });
  if (user) return user.id;
  const created = await db.user.create({ data: { id: uid, name, email, photoURL: picture } });
  return created.id;
}

/**
 * Returns user info following it's uid
 * @param uid User uid
 * @returns User info
 */
export async function getUser(uid: string) {
  const user = await db.user.findUnique({ where: { id: uid } });
  if (!user) throw new UserNotFoundError();

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    picture: user.photoURL,
    bio: user.bio,
    references: user.references,
    company: user.company,
    github: user.github,
    twitter: user.twitter,
    address: user.address,
  };
}
