import { db } from '../../libs/db';
import { UserNotFoundError } from '../../libs/errors';

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
