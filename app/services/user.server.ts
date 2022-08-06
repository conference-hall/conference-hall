import { db } from './db';

type UserInput = { uid: string; name: string; email?: string; picture?: string };

export async function createUser(input: UserInput) {
  const { uid, name, email, picture } = input;
  const user = await db.user.findUnique({ where: { id: uid } });
  if (user) return;
  await db.user.create({ data: { id: uid, name, email, photoURL: picture } });
}

export async function getUser(uid: string) {
  const user = await db.user.findUnique({ where: { id: uid } });
  // TODO: throw user not found
  return {
    id: user?.id || '',
    name: user?.name || '',
    email: user?.email || '',
    picture: user?.photoURL || '',
    bio: user?.bio || '',
    references: user?.references || '',
    company: user?.company || '',
    github: user?.github || '',
    twitter: user?.twitter || '',
    address: user?.address || '',
  };
}
