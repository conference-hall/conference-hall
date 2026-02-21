import { randCatchPhrase, randText } from '@ngneat/falso';
import { db } from '../../prisma/db.server.ts';
import type { Event } from '../../prisma/generated/client.ts';
import type { EventFormatCreateInput } from '../../prisma/generated/models.ts';

type FactoryOptions = {
  event: Event;
  attributes?: Partial<EventFormatCreateInput>;
};

export const eventFormatFactory = async (options: FactoryOptions) => {
  const { attributes = {}, event } = options;

  const maxOrder = await db.eventFormat.aggregate({
    where: { eventId: event.id },
    _max: { order: true },
  });

  const order = maxOrder._max.order !== null ? maxOrder._max.order + 1 : 0;

  const defaultAttributes: EventFormatCreateInput = {
    name: randCatchPhrase(),
    description: randText({ charCount: 100 }),
    order: attributes.order ?? order,
    event: { connect: { id: event.id } },
  };

  const data = { ...defaultAttributes, ...attributes };

  return db.eventFormat.create({ data });
};
