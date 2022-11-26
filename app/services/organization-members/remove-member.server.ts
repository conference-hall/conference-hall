import { OrganizationRole } from '@prisma/client';
import { db } from '../../libs/db';
import { ForbiddenOperationError } from '../../libs/errors';
import { getUserRole } from '../organization/get-user-role.server';

export async function removeMember(slug: string, uid: string, memberId: string) {
  if (uid === memberId) throw new ForbiddenOperationError();

  const role = await getUserRole(slug, uid);
  if (role !== OrganizationRole.OWNER) throw new ForbiddenOperationError();

  await db.organizationMember.deleteMany({ where: { organization: { slug }, memberId } });
}
