import { randCatchPhrase, randText } from '@ngneat/falso';
import type { Event } from 'prisma/generated/client.ts';
import type { EventCategoryCreateInput } from 'prisma/generated/models.ts';
import { db } from '../../prisma/db.server.ts';

type FactoryOptions = {
  event: Event;
  attributes?: Partial<EventCategoryCreateInput>;
};

export const eventCategoryFactory = (options: FactoryOptions) => {
  const { attributes = {}, event } = options;

  const defaultAttributes: EventCategoryCreateInput = {
    name: randCatchPhrase(),
    description: randText({ charCount: 100 }),
    event: { connect: { id: event.id } },
  };

  const data = { ...defaultAttributes, ...attributes };

  return db.eventCategory.create({ data });
};
