import * as fake from '@ngneat/falso';
import { Prisma } from '@prisma/client';
import { db } from '../../app/services/db';

type FactoryOptions = {
  eventId: string;
  attributes?: Partial<Prisma.EventFormatCreateInput>;
};

export const EventFormatFactory = {
  build: (options: FactoryOptions) => {
    const { attributes = {}, eventId } = options;

    const defaultAttributes: Prisma.EventFormatCreateInput = {
      name: fake.randCatchPhrase(),
      description: fake.randParagraph(),
      event: { connect: { id: eventId } },
    };

    return { ...defaultAttributes, ...attributes };
  },
  create: (options: FactoryOptions) => {
    const data = EventFormatFactory.build(options);
    return db.eventFormat.create({ data });
  },
};
