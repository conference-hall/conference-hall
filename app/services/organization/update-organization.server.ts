import type { OrganizationSaveData } from '~/schemas/organization';
import { db } from '../db';
import { OrganizationNotFoundError } from '../errors';

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
