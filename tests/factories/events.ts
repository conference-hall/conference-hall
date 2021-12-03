import { EventType, EventVisibility, Prisma } from '@prisma/client';
import slugify from 'limax';
import { v4 as uuid } from 'uuid';
import { db } from '../../app/server/db';
import { buildUser } from './users';

export async function buildEvent(input: Partial<Prisma.EventUncheckedCreateInput> = {}) {
  const slug = slugify(input.name || uuid());

  const data: Prisma.EventUncheckedCreateInput = {
    name: 'Event name',
    slug,
    description: 'Event Description',
    type: EventType.CONFERENCE,
    visibility: EventVisibility.PUBLIC,
    ...input,
    creatorId: input.creatorId || (await buildUser()).id,
  };

  return db.event.create({ data });
}
