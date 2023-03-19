import { db } from '../../../libs/db';

export async function hasAccess(uid: string) {
  const user = await db.user.findFirst({ select: { organizerKey: true, organizations: true }, where: { id: uid } });
  return Boolean(user?.organizerKey) || Boolean(user?.organizations?.length);
}
