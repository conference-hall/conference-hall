import { OrganizationRole } from '@prisma/client';
import { allowedForOrga } from '~/shared-server/organizations/check-user-role.server';
import type { EventCreateData } from '../types/event-create.schema';
import { db } from '~/libs/db';

export async function createEvent(orgaSlug: string, userId: string, data: EventCreateData) {
  await allowedForOrga(orgaSlug, userId, [OrganizationRole.OWNER]);

  return await db.$transaction(async (trx) => {
    const existSlug = await trx.event.findFirst({ where: { slug: data.slug } });
    if (existSlug) {
      return { error: { fieldErrors: { slug: 'Slug already exists, please try another one.' } } };
    }

    await trx.event.create({
      data: {
        ...data,
        creator: { connect: { id: userId } },
        organization: { connect: { slug: orgaSlug } },
      },
    });
    return { slug: data.slug };
  });
}
