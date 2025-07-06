import { db } from 'prisma/db.server.ts';
import { ForbiddenOperationError } from '../errors.server.ts';
import { type Permission, UserPermissions } from './user-permissions.server.ts';

export class UserEventAuthorization {
  constructor(
    protected userId: string,
    protected team: string,
    protected event: string,
  ) {}

  async needsPermission(permission: Permission) {
    const roles = UserPermissions.getRoleWith(permission);

    const event = await db.event.findFirst({
      where: {
        slug: this.event,
        team: {
          slug: this.team,
          members: { some: { memberId: this.userId, role: { in: roles } } },
        },
      },
    });

    if (!event) {
      throw new ForbiddenOperationError();
    }
    return event;
  }
}
