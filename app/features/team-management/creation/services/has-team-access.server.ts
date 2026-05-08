import { db } from '../../../../../prisma/db.server.ts';

export async function hasTeamAccess(userId: string): Promise<boolean> {
  const user = await db.user.findFirst({
    select: { organizerKey: true, teams: { select: { teamId: true } } },
    where: { id: userId },
  });
  return (user?.teams?.length ?? 0) > 0 || Boolean(user?.organizerKey);
}
