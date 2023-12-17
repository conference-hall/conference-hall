import { db } from 'prisma/db.server';

import { TeamBetaAccess } from '../organizer-team/TeamBetaAccess';
import { UserTeams } from '../organizer-team/UserTeams';
import { Notifications } from '../user-notifications/Notifications';

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
      isOrganizer: await teamAccess.isAllowed(),
      notificationsUnreadCount: await notifications.unreadCount(),
    };
  }
}
