import { TeamRole } from '@prisma/client';

import { db } from '~/libs/db.ts';
import { ForbiddenOperationError } from '~/libs/errors.ts';
import { allowedForTeam } from '~/routes/__server/teams/check-user-role.server.ts';

export async function removeMember(slug: string, userId: string, memberId: string) {
  if (userId === memberId) throw new ForbiddenOperationError();

  await allowedForTeam(slug, userId, [TeamRole.OWNER]);

  await db.teamMember.deleteMany({ where: { team: { slug }, memberId } });
}
