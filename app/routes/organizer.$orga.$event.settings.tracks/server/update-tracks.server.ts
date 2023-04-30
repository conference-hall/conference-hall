import { OrganizationRole } from '@prisma/client';
import { db } from '~/libs/db';
import { allowedForEvent } from '~/shared-server/organizations/check-user-role.server';
import type { EventTrackSaveData } from '../types/event-track-save.schema';

export async function saveFormat(eventSlug: string, userId: string, data: EventTrackSaveData) {
  await allowedForEvent(eventSlug, userId, [OrganizationRole.OWNER]);

  if (data.id) {
    await db.eventFormat.update({
      where: { id: data.id },
      data: { name: data.name, description: data.description },
    });
  } else {
    await db.eventFormat.create({
      data: { name: data.name, description: data.description, event: { connect: { slug: eventSlug } } },
    });
  }
}

export async function saveCategory(eventSlug: string, userId: string, data: EventTrackSaveData) {
  await allowedForEvent(eventSlug, userId, [OrganizationRole.OWNER]);

  if (data.id) {
    await db.eventCategory.update({
      where: { id: data.id },
      data: { name: data.name, description: data.description },
    });
  } else {
    await db.eventCategory.create({
      data: { name: data.name, description: data.description, event: { connect: { slug: eventSlug } } },
    });
  }
}

export async function deleteFormat(eventSlug: string, userId: string, formatId: string) {
  await allowedForEvent(eventSlug, userId, [OrganizationRole.OWNER]);

  await db.eventFormat.delete({ where: { id: formatId } });
}

export async function deleteCategory(eventSlug: string, userId: string, categoryId: string) {
  await allowedForEvent(eventSlug, userId, [OrganizationRole.OWNER]);

  await db.eventCategory.delete({ where: { id: categoryId } });
}
