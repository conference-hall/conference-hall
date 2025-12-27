import { db } from 'prisma/db.server.ts';
import type { TeamPermission } from '../authorization/types.ts';
import { ForbiddenOperationError } from '../errors.server.ts';
import { TeamAuthorization } from './team-authorization.server.ts';

export class EventAuthorization extends TeamAuthorization {
  protected event: string;

  constructor(userId: string, team: string, event: string) {
    super(userId, team);
    this.event = event;
  }

  async checkAuthorizedEvent(forPermission?: TeamPermission) {
    const { permissions } = await this.checkMemberPermissions(forPermission);

    const event = await db.event.findUnique({ where: { slug: this.event, team: { slug: this.team } } });
    if (!event) throw new ForbiddenOperationError();

    return { event, permissions };
  }
}
