import { OrganizationRole } from '@prisma/client';
import type { EventTrackSaveData } from '~/schemas/event';
import { db } from '../db';
import { checkAccess } from '../organizer-event/check-access.server';

export async function saveFormat(orgaSlug: string, eventSlug: string, uid: string, data: EventTrackSaveData) {
  await checkAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

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

export async function saveCategory(orgaSlug: string, eventSlug: string, uid: string, data: EventTrackSaveData) {
  await checkAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

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

export async function deleteFormat(orgaSlug: string, eventSlug: string, uid: string, formatId: string) {
  await checkAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

  await db.eventFormat.delete({ where: { id: formatId } });
}

export async function deleteCategory(orgaSlug: string, eventSlug: string, uid: string, categoryId: string) {
  await checkAccess(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

  await db.eventCategory.delete({ where: { id: categoryId } });
}
