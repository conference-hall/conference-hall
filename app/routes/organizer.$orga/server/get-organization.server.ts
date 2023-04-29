import { db } from '~/libs/db';
import { OrganizationNotFoundError } from '~/libs/errors';
import { buildInvitationLink } from '~/shared-server/invitations/build-link.server';

export type Organization = Awaited<ReturnType<typeof getOrganization>>;

export async function getOrganization(slug: string, userId: string) {
  const orgaMember = await db.organizationMember.findFirst({
    where: { memberId: userId, organization: { slug } },
    orderBy: { organization: { name: 'asc' } },
    include: { organization: true },
  });

  if (!orgaMember) throw new OrganizationNotFoundError();

  return {
    id: orgaMember.organization.id,
    name: orgaMember.organization.name,
    slug: orgaMember.organization.slug,
    role: orgaMember.role,
    invitationLink: buildInvitationLink(orgaMember.organization.invitationCode),
  };
}
