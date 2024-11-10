import { db } from 'prisma/db.server.ts';

import { TeamBetaAccess } from '../team/team-beta-access.ts';
import { UserTeams } from '../team/user-teams.ts';
import { Notifications } from '../user-notifications/notifications.ts';

export class UserInfo {
  static async get(userId: string | null) {
    if (!userId) return null;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const teams = await UserTeams.for(user.id).list();
    const hasTeamAccess = TeamBetaAccess.hasAccess(user, teams.length);
    const notificationsUnreadCount = await Notifications.for(user.id).unreadCount();

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      notificationsUnreadCount,
      hasTeamAccess,
      teams,
    };
  }
}
