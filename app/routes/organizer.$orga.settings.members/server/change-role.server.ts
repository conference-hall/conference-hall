import { OrganizationRole } from '@prisma/client';
import { db } from '~/libs/db';
import { ForbiddenOperationError } from '~/libs/errors';
import { allowedForOrga } from '~/shared-server/organizations/check-user-role.server';

export async function changeMemberRole(slug: string, userId: string, memberId: string, memberRole: OrganizationRole) {
  await allowedForOrga(slug, userId, [OrganizationRole.OWNER]);

  if (userId === memberId) throw new ForbiddenOperationError();

  await db.organizationMember.updateMany({
    data: { role: memberRole },
    where: { organization: { slug }, memberId },
  });
}
