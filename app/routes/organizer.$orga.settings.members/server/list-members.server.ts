import { db } from '../../../libs/db';
import { getUserRole } from '../../../shared-server/organizations/get-user-role.server';

export async function listMembers(slug: string, uid: string) {
  const role = await getUserRole(slug, uid);
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
    photoURL: member.photoURL,
  }));
}
