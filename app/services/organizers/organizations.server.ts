import { OrganizationRole } from '@prisma/client';
import type { OrganizationSaveData } from '~/schemas/organization';
import { db } from '../db';
import { ForbiddenOperationError, InvitationNotFoundError, OrganizationNotFoundError } from '../errors';
import { buildInvitationLink } from '../invitations/build-link.server';
import { getUserRole } from '../organization/get-user-role.server';

/**
 * Returns invitation link of an organization
 * @param slug organization slug
 * @param uid Id of the user
 * @returns invitation link
 */
export async function getInvitationLink(slug: string, uid: string) {
  const invite = await db.invite.findFirst({
    where: { organization: { slug, members: { some: { memberId: uid } } } },
  });
  return buildInvitationLink(invite?.id);
}

/**
 * Remove member
 * @param slug organization slug
 * @param uid Id of the user
 * @param memberId Id of the member to remove
 */
export async function removeMember(slug: string, uid: string, memberId: string) {
  if (uid === memberId) throw new ForbiddenOperationError();

  const role = await getUserRole(slug, uid);
  if (role !== OrganizationRole.OWNER) throw new ForbiddenOperationError();

  await db.organizationMember.deleteMany({ where: { organization: { slug }, memberId } });
}

/**
 * Invite a member to a organization
 * @param invitationId Id of the invitation
 * @param memberId Id of the member to add
 */
export async function inviteMemberToOrganization(invitationId: string, memberId: string) {
  const invitation = await db.invite.findUnique({
    select: { type: true, organization: true, invitedBy: true },
    where: { id: invitationId },
  });
  if (!invitation || invitation.type !== 'ORGANIZATION' || !invitation.organization) {
    throw new InvitationNotFoundError();
  }

  await db.organizationMember.create({
    data: { memberId, organizationId: invitation.organization.id },
  });

  return { slug: invitation.organization.slug };
}

/**
 * Create an organization
 * @param uid User id
 * @param data Organization data
 */
export async function createOrganization(uid: string, data: OrganizationSaveData) {
  return await db.$transaction(async (trx) => {
    const existSlug = await trx.organization.findFirst({ where: { slug: data.slug } });
    if (existSlug) return { fieldErrors: { slug: 'Slug already exists, please try another one.' } };

    const updated = await trx.organization.create({ select: { id: true }, data });
    await trx.organizationMember.create({
      data: { memberId: uid, organizationId: updated.id, role: OrganizationRole.OWNER },
    });
    return { slug: data.slug };
  });
}

/**
 * Update an organization
 * @param slug Slug of the organization to update
 * @param uid User id
 * @param data Organization data
 */
export async function updateOrganization(slug: string, uid: string, data: OrganizationSaveData) {
  let organization = await db.organization.findFirst({
    where: { slug, members: { some: { memberId: uid, role: 'OWNER' } } },
  });
  if (!organization) throw new OrganizationNotFoundError();

  return await db.$transaction(async (trx) => {
    const existSlug = await trx.organization.findFirst({ where: { slug: data.slug } });
    if (existSlug && existSlug.id !== organization?.id) {
      return { fieldErrors: { slug: 'Slug already exists, please try another one.' } };
    }

    await trx.organization.update({ select: { id: true }, where: { slug }, data });
    return { slug: data.slug };
  });
}
