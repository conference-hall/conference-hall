import { db } from '~/libs/db';

export async function checkOrganizerAccess(userId: string) {
  const user = await db.user.findFirst({ select: { organizerKey: true, teams: true }, where: { id: userId } });

  const hasOrganizations = Boolean(user?.teams?.length);

  return hasOrganizations || Boolean(user?.organizerKey);
}
