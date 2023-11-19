import { TeamRole } from '@prisma/client';

import { db } from '~/libs/db.ts';
import { ForbiddenOperationError } from '~/libs/errors.ts';

export async function allowedForEvent(slug: string, userId: string, roles?: TeamRole[]) {
  const rolesToCheck = roles || [TeamRole.MEMBER, TeamRole.REVIEWER, TeamRole.OWNER];

  const event = await db.event.findFirst({
    where: {
      slug,
      team: {
        members: {
          some: { memberId: userId, role: { in: rolesToCheck } },
        },
      },
    },
  });

  if (!event) throw new ForbiddenOperationError();

  return event;
}
