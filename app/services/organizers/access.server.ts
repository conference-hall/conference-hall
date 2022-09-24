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

/**
 * Validate organizer access through an API key
 * @param uid User id
 * @param key Organizer access key
 */
export async function validateOrganizerAccess(uid: string, key: string) {
  const access = await db.organizerKeyAccess.findUnique({ where: { id: key } });
  if (!access) {
    return { fieldErrors: { key: ['Invalid API key'] } };
  }
  await db.user.update({ where: { id: uid }, data: { organizerKey: key } });
}
