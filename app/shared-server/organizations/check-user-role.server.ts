import { OrganizationRole } from '@prisma/client';
import { db } from '~/libs/db';
import { ForbiddenOperationError } from '~/libs/errors';

export async function allowedForOrga(slug: string, userId: string, roles?: OrganizationRole[]) {
  const rolesToCheck = roles || [OrganizationRole.MEMBER, OrganizationRole.REVIEWER, OrganizationRole.OWNER];

  const orga = await db.organization.findFirst({
    where: {
      slug,
      members: {
        some: { memberId: userId, role: { in: rolesToCheck } },
      },
    },
  });

  if (!orga) throw new ForbiddenOperationError();

  return orga;
}

export async function allowedForEvent(slug: string, userId: string, roles?: OrganizationRole[]) {
  const rolesToCheck = roles || [OrganizationRole.MEMBER, OrganizationRole.REVIEWER, OrganizationRole.OWNER];

  const event = await db.event.findFirst({
    where: {
      slug,
      organization: {
        members: {
          some: { memberId: userId, role: { in: rolesToCheck } },
        },
      },
    },
  });

  if (!event) throw new ForbiddenOperationError();

  return event;
}
