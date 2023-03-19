import { OrganizationRole } from '@prisma/client';
import type { OrganizationSaveData } from '~/schemas/organization';
import { db } from '../../../libs/db';

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
