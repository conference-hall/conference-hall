import { db } from '../db';

/**
 * Get user organizations
 * @param uid Id of the user
 * @returns user organizations
 */
export async function getOrganizations(uid: string) {
  const organizations = await db.organizationMember.findMany({
    select: { role: true, organization: true },
    where: { memberId: uid },
    orderBy: { organization: { name: 'asc' } },
  });

  return organizations.map((member) => ({
    name: member.organization.name,
    slug: member.organization.slug,
    role: member.role,
  }));
}
