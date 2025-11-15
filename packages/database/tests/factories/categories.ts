import { randCatchPhrase, randText } from '@ngneat/falso';
import type { Event, Prisma } from '../../index.ts';
import { db } from '../../index.ts';

type FactoryOptions = {
  event: Event;
  attributes?: Partial<Prisma.EventCategoryCreateInput>;
};

export const eventCategoryFactory = (options: FactoryOptions) => {
  const { attributes = {}, event } = options;

  const defaultAttributes: Prisma.EventCategoryCreateInput = {
    name: randCatchPhrase(),
    description: randText({ charCount: 100 }),
    event: { connect: { id: event.id } },
  };

  const data = { ...defaultAttributes, ...attributes };

  return db.eventCategory.create({ data });
};
