import type { ProfileUpdateData } from '~/schemas/profile';
import { db } from '../db';
import { UserNotFoundError } from '../errors';

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
