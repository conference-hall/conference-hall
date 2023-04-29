import { OrganizationRole } from '@prisma/client';
import { db } from '../../../libs/db';
import { ForbiddenOperationError } from '../../../libs/errors';
import { getUserRole } from '../../../shared-server/organizations/get-user-role.server';
import type { EventCreateData } from '../types/event-create.schema';

export async function createEvent(orgaSlug: string, userId: string, data: EventCreateData) {
  const role = await getUserRole(orgaSlug, userId);
  if (role !== OrganizationRole.OWNER) throw new ForbiddenOperationError();

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
