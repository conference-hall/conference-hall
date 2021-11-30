import { EventType, EventVisibility, Prisma } from '@prisma/client';
import { db } from '../../app/server/db';
import { buildUser } from './users';

export async function buildEvent(input: Partial<Prisma.EventUncheckedCreateInput> = {}) {
  const data: Prisma.EventUncheckedCreateInput = {
    name: 'Event name',
    description: 'Event Description',
    type: EventType.CONFERENCE,
    visibility: EventVisibility.PUBLIC,
    ...input,
    creatorId: input.creatorId || (await buildUser()).id,
  };

  return db.event.create({ data });
}
