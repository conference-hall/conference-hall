import { OrganizationRole } from '@prisma/client';
import { db } from '../../../libs/db';
import { ForbiddenOperationError } from '../../../libs/errors';
import { getUserRole } from '../../../shared-server/organizations/get-user-role.server';

export async function removeMember(slug: string, userId: string, memberId: string) {
  if (userId === memberId) throw new ForbiddenOperationError();

  const role = await getUserRole(slug, userId);
  if (role !== OrganizationRole.OWNER) throw new ForbiddenOperationError();

  await db.organizationMember.deleteMany({ where: { organization: { slug }, memberId } });
}
