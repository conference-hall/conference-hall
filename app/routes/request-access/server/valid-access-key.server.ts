import { db } from '~/libs/db';

export async function validAccessKey(userId: string, key: string) {
  const access = await db.organizerKeyAccess.findFirst({ where: { id: key, revokedAt: { equals: null } } });
  if (!access) {
    return { errors: { key: 'Invalid API key' } };
  }
  await db.user.update({ where: { id: userId }, data: { organizerKey: key } });
}
