import { OrganizationRole } from '@prisma/client';
import { db } from '~/libs/db';
import { ForbiddenOperationError } from '~/libs/errors';

export async function allowedForOrga(orga: string, userId: string, roles?: OrganizationRole[]) {
  const rolesToCheck = roles || [OrganizationRole.MEMBER, OrganizationRole.REVIEWER, OrganizationRole.OWNER];

  const allowed = await db.organizationMember.count({
    where: {
      memberId: userId,
      organization: { slug: orga },
      role: { in: rolesToCheck },
    },
  });
  if (!allowed) throw new ForbiddenOperationError();
  return true;
}

export async function allowedForEvent(event: string, userId: string, roles?: OrganizationRole[]) {
  const rolesToCheck = roles || [OrganizationRole.MEMBER, OrganizationRole.REVIEWER, OrganizationRole.OWNER];

  const allowed = await db.organizationMember.count({
    where: {
      memberId: userId,
      organization: { events: { some: { slug: event } } },
      role: { in: rolesToCheck },
    },
  });

  if (!allowed) throw new ForbiddenOperationError();
  return true;
}
