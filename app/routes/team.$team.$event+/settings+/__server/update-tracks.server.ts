import { TeamRole } from '@prisma/client';
import { z } from 'zod';

import { db } from '~/libs/db.ts';
import { allowedForEvent } from '~/routes/__server/teams/check-user-role.server.ts';

export const EventTrackSaveSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1),
  description: z.string().trim().nullable().default(null),
});

type EventTrackSaveData = z.infer<typeof EventTrackSaveSchema>;

export async function saveFormat(eventSlug: string, userId: string, data: EventTrackSaveData) {
  await allowedForEvent(eventSlug, userId, [TeamRole.OWNER]);

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
  await allowedForEvent(eventSlug, userId, [TeamRole.OWNER]);

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
  await allowedForEvent(eventSlug, userId, [TeamRole.OWNER]);

  await db.eventFormat.delete({ where: { id: formatId } });
}

export async function deleteCategory(eventSlug: string, userId: string, categoryId: string) {
  await allowedForEvent(eventSlug, userId, [TeamRole.OWNER]);

  await db.eventCategory.delete({ where: { id: categoryId } });
}
