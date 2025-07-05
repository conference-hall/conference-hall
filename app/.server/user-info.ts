import { db } from 'prisma/db.server.ts';
import { Notifications } from '~/features/notifications/services/notifications.server.ts';
import { TeamBetaAccess } from '~/features/team-management/creation/services/team-beta-access.server.ts';
import { UserTeams } from '~/features/team-management/creation/services/user-teams.server.ts';

export class UserInfo {
  static async get(userId: string | undefined) {
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
