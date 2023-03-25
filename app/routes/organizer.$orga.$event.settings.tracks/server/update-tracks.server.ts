import { OrganizationRole } from '@prisma/client';
import { db } from '~/libs/db';
import { checkUserRole } from '~/shared-server/organizations/check-user-role.server';
import type { EventTrackSaveData } from '../types/event-track-save.schema';

export async function saveFormat(orgaSlug: string, eventSlug: string, uid: string, data: EventTrackSaveData) {
  await checkUserRole(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

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
  await checkUserRole(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

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
  await checkUserRole(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

  await db.eventFormat.delete({ where: { id: formatId } });
}

export async function deleteCategory(orgaSlug: string, eventSlug: string, uid: string, categoryId: string) {
  await checkUserRole(orgaSlug, eventSlug, uid, [OrganizationRole.OWNER]);

  await db.eventCategory.delete({ where: { id: categoryId } });
}
