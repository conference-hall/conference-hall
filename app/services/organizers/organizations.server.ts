import type { OrganizationSaveData } from '~/schemas/organization';
import { db } from '../db';
import { OrganizationNotFoundError } from '../errors';
import { buildInvitationLink } from '../invitations/build-link.server';

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
