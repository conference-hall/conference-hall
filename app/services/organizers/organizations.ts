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
  const orgaMember = await db.organizationMember.findFirst({
    where: { memberId: uid, organization: { slug } },
    orderBy: { organization: { name: 'asc' } },
    include: { organization: true },
  });

  if (!orgaMember) throw new OrganizationNotFoundError();

  return {
    name: orgaMember.organization.name,
    slug: orgaMember.organization.slug,
    role: orgaMember.role,
  };
}

/**
 * Get organization events
 * @param slug organization slug
 * @param uid Id of the user
 * @returns organization
 */
export async function getOrganizationEvents(slug: string, uid: string) {
  const events = await db.event.findMany({
    where: { organization: { slug, members: { some: { memberId: uid } } } },
    orderBy: { name: 'asc' },
  });
  return events.map((event) => ({
    slug: event.slug,
    name: event.name,
    type: event.type,
  }));
}
