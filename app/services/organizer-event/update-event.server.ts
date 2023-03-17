import type { Prisma } from '@prisma/client';
import { OrganizationRole } from '@prisma/client';
import { geocode } from '~/libs/geocode/geocode';
import { db } from '../../libs/db';
import { EventNotFoundError } from '../../libs/errors';
import { checkAccess } from './check-access.server';

/**
 * Update an event
 * @param orgaSlug Organization slug
 * @param eventSlug Event slug
 * @param uid User id
 * @param data event data
 */
export async function updateEvent(
  orgaSlug: string,
  eventSlug: string,
  uid: string,
  data: Partial<Prisma.EventCreateInput>
) {
  await checkAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

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
        return { error: 'Slug already exists, please try another one.' };
      }
    }
    const updated = await trx.event.update({ where: { slug: eventSlug }, data: { ...data } });
    return { slug: updated.slug };
  });
}
