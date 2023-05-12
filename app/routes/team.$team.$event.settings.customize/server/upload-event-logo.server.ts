import { TeamRole } from '@prisma/client';
import { unstable_parseMultipartFormData } from '@remix-run/node';
import { z } from 'zod';
import { db } from '~/libs/db';
import { uploadToStorageHandler } from '~/libs/storage/storage.server';
import { allowedForEvent } from '~/shared-server/organizations/check-user-role.server';

type UploadLogoResult = {
  status: 'success' | 'error';
  message?: string;
};

export async function uploadEventLogo(eventSlug: string, userId: string, request: Request): Promise<UploadLogoResult> {
  await allowedForEvent(eventSlug, userId, [TeamRole.OWNER]);

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadToStorageHandler({ name: 'logo', maxFileSize: 300_000 })
  );

  const result = z.string().url().safeParse(formData.get('logo'));

  if (result.success) {
    await db.event.update({ where: { slug: eventSlug }, data: { logo: result.data } });
    return { status: 'success' };
  } else {
    return { status: 'error', message: 'An error occurred during upload, you may exceed max file size.' };
  }
}
