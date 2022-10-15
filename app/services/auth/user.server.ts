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
 * Get a user data
 * @param userId Id of the user
 * @returns user data
 */
export async function getUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { _count: { select: { organizations: true } } },
  });
  if (!user) throw new UserNotFoundError();
  return {
    id: user.id,
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
