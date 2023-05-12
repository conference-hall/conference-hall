import type { Prisma } from '@prisma/client';
import { OrganizationRole } from '@prisma/client';
import { geocode } from '~/libs/geocode/geocode';
import { allowedForEvent } from './check-user-role.server';
import { db } from '~/libs/db';
import { EventNotFoundError } from '~/libs/errors';

export async function updateEvent(eventSlug: string, userId: string, data: Partial<Prisma.EventCreateInput>) {
  await allowedForEvent(eventSlug, userId, [OrganizationRole.OWNER]);

  const event = await db.event.findFirst({ where: { slug: eventSlug } });
  if (!event) throw new EventNotFoundError();

  if (data.address && event?.address !== data.address) {
    const geocodedAddress = await geocode(data.address);
    data.address = geocodedAddress.address;
    data.lat = geocodedAddress.lat;
    data.lng = geocodedAddress.lng;
  }

  return await db.$transaction(async (trx) => {
    if (data.slug) {
      const existSlug = await trx.event.findFirst({ where: { slug: data.slug } });
      if (existSlug && event?.id !== existSlug.id) {
        return { error: 'This URL already exists, please try another one.' };
      }
    }
    const updated = await trx.event.update({ where: { slug: eventSlug }, data: { ...data } });
    return { slug: updated.slug };
  });
}
