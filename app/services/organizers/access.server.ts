import { db } from '../db';

/**
 * Check if user has access as organizer
 * @param uid Id of the user
 * @returns true if user has organizer access
 */
export async function hasOrganizerAccess(uid: string) {
  const user = await db.user.findFirst({ select: { organizerKey: true, organizations: true }, where: { id: uid } });
  return Boolean(user?.organizerKey) || Boolean(user?.organizations?.length);
}
