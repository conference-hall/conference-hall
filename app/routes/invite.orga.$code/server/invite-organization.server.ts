import { db } from '~/libs/db';

export async function checkOrganizationInviteCode(code: string) {
  const organization = await db.organization.findUnique({ where: { invitationCode: code } });
  if (!organization) return null;
  return { id: organization.id, name: organization.name, slug: organization.slug };
}

export async function addMember(code: string, userId: string) {
  const orga = await checkOrganizationInviteCode(code);

  if (!orga) return null;

  await db.organizationMember.create({ data: { memberId: userId, organizationId: orga.id } });

  return { slug: orga.slug };
}
