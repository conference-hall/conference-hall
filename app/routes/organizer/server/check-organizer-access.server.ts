import { db } from '~/libs/db';

export async function checkOrganizerAccess(uid: string) {
  const user = await db.user.findFirst({ select: { organizerKey: true, organizations: true }, where: { id: uid } });

  const hasOrganizations = Boolean(user?.organizations?.length);

  return hasOrganizations || Boolean(user?.organizerKey);
}
