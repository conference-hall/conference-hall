import { db } from '../db';

/**
 * Validate organizer access through an API key
 * @param uid User id
 * @param key Organizer access key
 */
export async function validateOrganizerAccess(uid: string, key: string) {
  const access = await db.organizerKeyAccess.findFirst({ where: { id: key, revokedAt: { equals: null } } });
  if (!access) {
    return { fieldErrors: { key: ['Invalid API key'] } };
  }
  await db.user.update({ where: { id: uid }, data: { organizerKey: key } });
}
