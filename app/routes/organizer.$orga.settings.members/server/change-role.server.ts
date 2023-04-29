import { OrganizationRole } from '@prisma/client';
import { db } from '../../../libs/db';
import { ForbiddenOperationError } from '../../../libs/errors';
import { getUserRole } from '../../../shared-server/organizations/get-user-role.server';

export async function changeMemberRole(slug: string, userId: string, memberId: string, memberRole: OrganizationRole) {
  if (userId === memberId) throw new ForbiddenOperationError();

  const role = await getUserRole(slug, userId);
  if (role !== OrganizationRole.OWNER) throw new ForbiddenOperationError();

  await db.organizationMember.updateMany({
    data: { role: memberRole },
    where: { organization: { slug }, memberId },
  });
}
