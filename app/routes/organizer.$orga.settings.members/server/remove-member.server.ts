import { OrganizationRole } from '@prisma/client';
import { db } from '~/libs/db';
import { ForbiddenOperationError } from '~/libs/errors';
import { allowedForOrga } from '~/shared-server/organizations/check-user-role.server';

export async function removeMember(slug: string, userId: string, memberId: string) {
  if (userId === memberId) throw new ForbiddenOperationError();

  await allowedForOrga(slug, userId, [OrganizationRole.OWNER]);

  await db.organizationMember.deleteMany({ where: { organization: { slug }, memberId } });
}
