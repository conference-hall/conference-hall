import * as fake from '@ngneat/falso';
import { Event, Prisma } from '@prisma/client';
import { db } from '../../app/services/db';

type FactoryOptions = {
  event: Event;
  attributes?: Partial<Prisma.EventFormatCreateInput>;
};

export const eventFormatFactory = (options: FactoryOptions) => {
  const { attributes = {}, event } = options;

  const defaultAttributes: Prisma.EventFormatCreateInput = {
    name: fake.randCatchPhrase(),
    description: fake.randParagraph(),
    event: { connect: { id: event.id } },
  };

  const data = { ...defaultAttributes, ...attributes };

  return db.eventFormat.create({ data });
};
