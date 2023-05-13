import { TeamRole } from '@prisma/client';

import { db } from '~/libs/db';
import { ForbiddenOperationError } from '~/libs/errors';

export async function allowedForTeam(slug: string, userId: string, roles?: TeamRole[]) {
  const rolesToCheck = roles || [TeamRole.MEMBER, TeamRole.REVIEWER, TeamRole.OWNER];

  const team = await db.team.findFirst({
    where: {
      slug,
      members: {
        some: { memberId: userId, role: { in: rolesToCheck } },
      },
    },
  });

  if (!team) throw new ForbiddenOperationError();

  return team;
}

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
