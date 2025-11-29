import { randCatchPhrase, randText } from '@ngneat/falso';
import type { Event } from 'prisma/generated/client.ts';
import type { EventCategoryCreateInput } from 'prisma/generated/models.ts';
import { db } from '../../prisma/db.server.ts';

type FactoryOptions = {
  event: Event;
  attributes?: Partial<EventCategoryCreateInput>;
};

export const eventCategoryFactory = async (options: FactoryOptions) => {
  const { attributes = {}, event } = options;

  const maxOrder = await db.eventCategory.aggregate({
    where: { eventId: event.id },
    _max: { order: true },
  });

  const order = maxOrder._max.order !== null ? maxOrder._max.order + 1 : 0;

  const defaultAttributes: EventCategoryCreateInput = {
    name: randCatchPhrase(),
    description: randText({ charCount: 100 }),
    order: attributes.order ?? order,
    event: { connect: { id: event.id } },
  };

  const data = { ...defaultAttributes, ...attributes };

  return db.eventCategory.create({ data });
};
