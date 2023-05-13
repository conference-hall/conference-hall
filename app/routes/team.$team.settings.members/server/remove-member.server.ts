import { TeamRole } from '@prisma/client';
import { db } from '~/libs/db';
import { ForbiddenOperationError } from '~/libs/errors';
import { allowedForTeam } from '~/server/teams/check-user-role.server';

export async function removeMember(slug: string, userId: string, memberId: string) {
  if (userId === memberId) throw new ForbiddenOperationError();

  await allowedForTeam(slug, userId, [TeamRole.OWNER]);

  await db.teamMember.deleteMany({ where: { team: { slug }, memberId } });
}
