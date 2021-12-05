import { Prisma } from '@prisma/client';
import { db } from '../../app/services/db';
import { buildEvent } from './events';

export async function buildCategory(input: Partial<Prisma.EventCategoryUncheckedCreateInput> = {}) {
  const data: Prisma.EventCategoryUncheckedCreateInput = {
    name: 'Category name',
    ...input,
    eventId: input.eventId || (await buildEvent()).id,
  };

  return db.eventCategory.create({ data });
}
