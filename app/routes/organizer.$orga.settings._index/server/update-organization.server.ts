import { allowedForOrga } from '~/shared-server/organizations/check-user-role.server';
import type { OrganizationSaveData } from '../types/organization-save.schema';
import { OrganizationRole } from '@prisma/client';
import { db } from '~/libs/db';

export async function updateOrganization(slug: string, userId: string, data: OrganizationSaveData) {
  const organization = await allowedForOrga(slug, userId, [OrganizationRole.OWNER]);

  return await db.$transaction(async (trx) => {
    const existSlug = await trx.organization.findFirst({ where: { slug: data.slug } });
    if (existSlug && existSlug.id !== organization?.id) {
      return { fieldErrors: { slug: 'This URL already exists, please try another one.' } };
    }

    await trx.organization.update({ select: { id: true }, where: { slug }, data });
    return { slug: data.slug };
  });
}
