import { db } from '../../../libs/db';
import { getUserRole } from '../../../shared-server/organizations/get-user-role.server';

export async function listMembers(slug: string, userId: string) {
  const role = await getUserRole(slug, userId);
  if (!role) return [];

  const members = await db.organizationMember.findMany({
    where: { organization: { slug } },
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
