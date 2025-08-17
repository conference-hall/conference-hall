import { randCatchPhrase, randText } from '@ngneat/falso';
import type { Event } from 'prisma/generated/client.ts';
import type { EventFormatCreateInput } from 'prisma/generated/models.ts';
import { db } from '../../prisma/db.server.ts';

type FactoryOptions = {
  event: Event;
  attributes?: Partial<EventFormatCreateInput>;
};

export const eventFormatFactory = (options: FactoryOptions) => {
  const { attributes = {}, event } = options;

  const defaultAttributes: EventFormatCreateInput = {
    name: randCatchPhrase(),
    description: randText({ charCount: 100 }),
    event: { connect: { id: event.id } },
  };

  const data = { ...defaultAttributes, ...attributes };

  return db.eventFormat.create({ data });
};
