import { OrganizationRole } from '@prisma/client';
import { db } from '../../libs/db';
import { ForbiddenOperationError } from '../../libs/errors';

export async function checkUserRole(orgaSlug: string, eventSlug: string, userId: string, roles?: OrganizationRole[]) {
  if (!orgaSlug || !eventSlug) throw new ForbiddenOperationError();

  const rolesToCheck = roles || [OrganizationRole.MEMBER, OrganizationRole.REVIEWER, OrganizationRole.OWNER];

  const member = await db.organizationMember.findFirst({
    where: {
      memberId: userId,
      organization: {
        slug: orgaSlug,
        events: { some: { slug: eventSlug } },
      },
    },
  });

  if (!member || !rolesToCheck.includes(member.role)) {
    throw new ForbiddenOperationError();
  }
  return member.role;
}
