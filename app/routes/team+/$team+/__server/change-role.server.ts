import { TeamRole } from '@prisma/client';

import { db } from '~/libs/db.ts';
import { ForbiddenOperationError } from '~/libs/errors.ts';
import { allowedForTeam } from '~/routes/__server/teams/check-user-role.server.ts';

export async function changeMemberRole(slug: string, userId: string, memberId: string, memberRole: TeamRole) {
  await allowedForTeam(slug, userId, [TeamRole.OWNER]);

  if (userId === memberId) throw new ForbiddenOperationError();

  await db.teamMember.updateMany({
    data: { role: memberRole },
    where: { team: { slug }, memberId },
  });
}
