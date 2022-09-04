import { db } from '../db';
import { OrganizationNotFoundError } from '../errors';

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

/**
 * Get organization for user
 * @param slug organization slug
 * @param uid Id of the user
 * @returns organization
 */
export async function getOrganization(slug: string, uid: string) {
  const organization = await db.organization.findFirst({
    select: { name: true, slug: true },
    where: { slug, members: { some: { memberId: uid } } },
  });
  if (!organization) throw new OrganizationNotFoundError();
  return organization;
}
