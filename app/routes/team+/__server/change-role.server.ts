import { TeamRole } from '@prisma/client';

import { db } from '~/libs/db';
import { ForbiddenOperationError } from '~/libs/errors';
import { allowedForTeam } from '~/routes/__server/teams/check-user-role.server';

export async function changeMemberRole(slug: string, userId: string, memberId: string, memberRole: TeamRole) {
  await allowedForTeam(slug, userId, [TeamRole.OWNER]);

  if (userId === memberId) throw new ForbiddenOperationError();

  await db.teamMember.updateMany({
    data: { role: memberRole },
    where: { team: { slug }, memberId },
  });
}
