import { db } from 'prisma/db.server.ts';

import { TeamBetaAccess } from '../team/team-beta-access.ts';
import { UserTeams } from '../team/user-teams.ts';
import { Notifications } from '../user-notifications/notifications.ts';

export type UserInfoData = Awaited<ReturnType<typeof UserInfo.get>>;

export class UserInfo {
  static async get(userId: string | null) {
    if (!userId) return null;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const teamAccess = TeamBetaAccess.for(user.id);
    const teams = UserTeams.for(user.id);
    const notifications = Notifications.for(user.id);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      teams: await teams.list(),
      hasTeamAccess: await teamAccess.isAllowed(),
      notificationsUnreadCount: await notifications.unreadCount(),
    };
  }
}
