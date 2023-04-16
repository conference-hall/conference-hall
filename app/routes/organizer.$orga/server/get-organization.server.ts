import { db } from '~/libs/db';
import { OrganizationNotFoundError } from '~/libs/errors';

export type Organization = Awaited<ReturnType<typeof getOrganization>>;

export async function getOrganization(slug: string, uid: string) {
  const orgaMember = await db.organizationMember.findFirst({
    where: { memberId: uid, organization: { slug } },
    orderBy: { organization: { name: 'asc' } },
    include: { organization: true },
  });

  if (!orgaMember) throw new OrganizationNotFoundError();

  return {
    id: orgaMember.organization.id,
    name: orgaMember.organization.name,
    slug: orgaMember.organization.slug,
    role: orgaMember.role,
  };
}
