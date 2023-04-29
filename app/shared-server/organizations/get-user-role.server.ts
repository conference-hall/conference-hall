import { db } from '../../libs/db';

// TODO use directly user role from user object
export async function getUserRole(slug: string, userId: string) {
  const orgaMember = await db.organizationMember.findFirst({ where: { memberId: userId, organization: { slug } } });
  if (!orgaMember) return null;
  return orgaMember.role;
}
