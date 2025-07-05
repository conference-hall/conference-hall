import { db } from 'prisma/db.server.ts';
import { NotAuthorizedError } from '~/shared/errors.server.ts';

// todo(folders): should be in a authorization service ?
export async function needsAdminRole(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId, admin: true } });
  if (!user) {
    throw new NotAuthorizedError();
  }
}
