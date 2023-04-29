import { db } from '../../../libs/db';
import { OrganizationNotFoundError } from '../../../libs/errors';
import type { OrganizationSaveData } from '../types/organization-save.schema';

export async function updateOrganization(slug: string, userId: string, data: OrganizationSaveData) {
  let organization = await db.organization.findFirst({
    where: { slug, members: { some: { memberId: userId, role: 'OWNER' } } },
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
