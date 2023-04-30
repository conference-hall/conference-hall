import { db } from '~/libs/db';
import { InvitationInvalidOrAccepted, InvitationNotFoundError } from '~/libs/errors';

export async function checkOrganizationInviteCode(code: string) {
  const organization = await db.organization.findUnique({ where: { invitationCode: code } });

  if (!organization) throw new InvitationNotFoundError();

  return { id: organization.id, name: organization.name, slug: organization.slug };
}

export async function addMember(code: string, userId: string) {
  const orga = await checkOrganizationInviteCode(code);

  try {
    await db.organizationMember.create({ data: { memberId: userId, organizationId: orga.id } });
  } catch (e) {
    throw new InvitationInvalidOrAccepted();
  }

  return { slug: orga.slug };
}
