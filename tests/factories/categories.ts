import * as fake from '@ngneat/falso';
import { Event, Prisma } from '@prisma/client';
import { db } from '../../app/services/db';

type FactoryOptions = {
  event: Event;
  attributes?: Partial<Prisma.EventCategoryCreateInput>;
};

export const eventCategoryFactory = (options: FactoryOptions) => {
  const { attributes = {}, event } = options;

  const defaultAttributes: Prisma.EventCategoryCreateInput = {
    name: fake.randCatchPhrase(),
    description: fake.randParagraph(),
    event: { connect: { id: event.id } },
  };

  const data = { ...defaultAttributes, ...attributes };

  return db.eventCategory.create({ data });
};
