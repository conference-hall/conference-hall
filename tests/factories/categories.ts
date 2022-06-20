import * as fake from '@ngneat/falso';
import { Prisma } from '@prisma/client';
import { db } from '../../app/services/db';

type FactoryOptions = {
  eventId: string;
  attributes?: Partial<Prisma.EventCategoryCreateInput>;
};

export const EventCategoryFactory = {
  build: (options: FactoryOptions) => {
    const { attributes = {}, eventId } = options;

    const defaultAttributes: Prisma.EventCategoryCreateInput = {
      name: fake.randCatchPhrase(),
      description: fake.randParagraph(),
      event: { connect: { id: eventId } },
    };

    return { ...defaultAttributes, ...attributes };
  },
  create: (options: FactoryOptions) => {
    const data = EventCategoryFactory.build(options);
    return db.eventCategory.create({ data });
  },
};
