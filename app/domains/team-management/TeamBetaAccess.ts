import { db } from '~/libs/db';
import { ForbiddenOperationError, InvalidAccessKeyError } from '~/libs/errors';

export class TeamBetaAccess {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new TeamBetaAccess(userId);
  }

  async check() {
    const user = await db.user.findFirst({ select: { organizerKey: true, teams: true }, where: { id: this.userId } });
    const hasOrganizations = Boolean(user?.teams?.length);
    if (!hasOrganizations && !user?.organizerKey) {
      throw new ForbiddenOperationError();
    }
  }

  async validateAccessKey(key: string) {
    const access = await db.organizerKeyAccess.findFirst({ where: { id: key, revokedAt: { equals: null } } });
    if (!access) throw new InvalidAccessKeyError();
    return db.user.update({ where: { id: this.userId }, data: { organizerKey: key } });
  }
}
