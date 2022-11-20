import { OrganizationRole } from '@prisma/client';
import { db } from '../db';
import { ForbiddenOperationError } from '../errors';
import { getUserRole } from '../organization/get-user-role.server';

export async function changeMemberRole(slug: string, uid: string, memberId: string, memberRole: OrganizationRole) {
  if (uid === memberId) throw new ForbiddenOperationError();

  const role = await getUserRole(slug, uid);
  if (role !== OrganizationRole.OWNER) throw new ForbiddenOperationError();

  await db.organizationMember.updateMany({
    data: { role: memberRole },
    where: { organization: { slug }, memberId },
  });
}
