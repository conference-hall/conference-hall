import { OrganizationRole } from '@prisma/client';
import type { EventCreateData } from '~/schemas/event';
import { db } from '../../libs/db';
import { ForbiddenOperationError } from '../../libs/errors';
import { getUserRole } from '../organization/get-user-role.server';

export async function createEvent(orgaSlug: string, uid: string, data: EventCreateData) {
  const role = await getUserRole(orgaSlug, uid);
  if (role !== OrganizationRole.OWNER) throw new ForbiddenOperationError();

  return await db.$transaction(async (trx) => {
    const existSlug = await trx.event.findFirst({ where: { slug: data.slug } });
    if (existSlug) {
      return { error: { fieldErrors: { slug: 'Slug already exists, please try another one.' } } };
    }

    await trx.event.create({
      data: {
        ...data,
        creator: { connect: { id: uid } },
        organization: { connect: { slug: orgaSlug } },
      },
    });
    return { slug: data.slug };
  });
}
