import { db } from '../db';

// TODO use directly user role from user object
export async function getUserRole(slug: string, uid: string) {
  const orgaMember = await db.organizationMember.findFirst({ where: { memberId: uid, organization: { slug } } });
  if (!orgaMember) return null;
  return orgaMember.role;
}
