import { db } from '~/libs/db';

import { Notifications } from '../notifications/Notifications';
import { TeamBetaAccess } from '../team/TeamBetaAccess';
import { UserTeams } from '../team/UserTeams';

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
