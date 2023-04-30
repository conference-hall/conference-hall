import { OrganizationRole } from '@prisma/client';
import { unstable_parseMultipartFormData } from '@remix-run/node';
import { z } from 'zod';
import { db } from '~/libs/db';
import { EventNotFoundError } from '~/libs/errors';
import { uploadToStorageHandler } from '~/libs/storage/storage.server';
import { allowedForEvent } from '~/shared-server/organizations/check-user-role.server';

export async function uploadEventBanner(eventSlug: string, userId: string, request: Request) {
  await allowedForEvent(eventSlug, userId, [OrganizationRole.OWNER]);

  const event = await db.event.findFirst({ where: { slug: eventSlug } });
  if (!event) throw new EventNotFoundError();

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadToStorageHandler({ name: 'logo', path: event.id, maxFileSize: 300_000 })
  );

  const result = z.string().url().safeParse(formData.get('logo'));
  if (result.success) {
    await db.event.update({ where: { slug: eventSlug }, data: { logo: result.data } });
  }
}
