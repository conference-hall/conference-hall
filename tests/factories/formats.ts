import { Prisma } from '@prisma/client';
import { db } from '../../app/services/db';
import { buildEvent } from './events';

export async function buildFormat(input: Partial<Prisma.EventFormatUncheckedCreateInput> = {}) {
  const data: Prisma.EventFormatUncheckedCreateInput = {
    name: 'Format name',
    ...input,
    eventId: input.eventId || (await buildEvent()).id,
  };

  return db.eventFormat.create({ data });
}
