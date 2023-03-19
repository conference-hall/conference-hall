import { db } from '../../../libs/db';

export async function checkAccessKey(uid: string, key: string) {
  const access = await db.organizerKeyAccess.findFirst({ where: { id: key, revokedAt: { equals: null } } });
  if (!access) {
    return { fieldErrors: { key: ['Invalid API key'] } };
  }
  await db.user.update({ where: { id: uid }, data: { organizerKey: key } });
}
