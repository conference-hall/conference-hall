import { db } from 'prisma/db.server.ts';
import { NotAuthorizedError } from '~/libs/errors.server.ts';

export async function needsAdminRole(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId, admin: true } });
  if (!user) {
    throw new NotAuthorizedError();
  }
}
