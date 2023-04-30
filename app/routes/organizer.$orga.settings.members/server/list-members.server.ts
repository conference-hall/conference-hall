import { OrganizationRole } from '@prisma/client';
import { db } from '~/libs/db';
import { allowedForOrga } from '~/shared-server/organizations/check-user-role.server';

export async function listMembers(orgaSlug: string, userId: string) {
  await allowedForOrga(orgaSlug, userId, [OrganizationRole.OWNER]);

  const members = await db.organizationMember.findMany({
    where: { organization: { slug: orgaSlug } },
    orderBy: { member: { name: 'asc' } },
    include: { member: true },
  });

  return members.map(({ member, role }) => ({
    role,
    id: member.id,
    name: member.name,
    picture: member.picture,
  }));
}
