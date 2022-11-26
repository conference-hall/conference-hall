import type { ProfileUpdateData } from '~/schemas/profile';
import { db } from '../../libs/db';
import { UserNotFoundError } from '../../libs/errors';

export async function saveProfile(userId: string, data: ProfileUpdateData) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new UserNotFoundError();

  await db.user.update({ where: { id: userId }, data });
}
