import type { UserCreateInput } from '~/schemas/user';
import { db } from '../db';

export async function createUser(input: UserCreateInput) {
  const { uid, name, email, picture } = input;
  const user = await db.user.findUnique({ where: { id: uid } });
  if (user) return user.id;
  const created = await db.user.create({ data: { id: uid, name, email, photoURL: picture } });
  return created.id;
}
