import { db } from '@conference-hall/database';
import { InvalidAccessKeyError } from '~/shared/errors.server.ts';

export class TeamBetaAccess {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new TeamBetaAccess(userId);
  }

  static hasAccess(user: { organizerKey: string | null } | null, teamsCount = 0) {
    if (!user) return false;
    return teamsCount > 0 || Boolean(user.organizerKey);
  }

  async validateAccessKey(key: string) {
    const access = await db.organizerKeyAccess.findFirst({ where: { id: key, revokedAt: { equals: null } } });
    if (!access) throw new InvalidAccessKeyError();
    return db.user.update({ where: { id: this.userId }, data: { organizerKey: key } });
  }
}
