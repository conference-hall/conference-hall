import { randCatchPhrase, randParagraph } from '@ngneat/falso';
import type { Event, Prisma } from '@prisma/client/app/index.js';

import { db } from '../../prisma/db.server.ts';

type FactoryOptions = {
  event: Event;
  attributes?: Partial<Prisma.EventCategoryCreateInput>;
};

export const eventCategoryFactory = (options: FactoryOptions) => {
  const { attributes = {}, event } = options;

  const defaultAttributes: Prisma.EventCategoryCreateInput = {
    name: randCatchPhrase(),
    description: randParagraph(),
    event: { connect: { id: event.id } },
  };

  const data = { ...defaultAttributes, ...attributes };

  return db.eventCategory.create({ data });
};
