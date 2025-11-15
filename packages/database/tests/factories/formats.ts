import { randCatchPhrase, randText } from '@ngneat/falso';
import { db, type Event, type Prisma } from '../../index.ts';

type FactoryOptions = {
  event: Event;
  attributes?: Partial<Prisma.EventFormatCreateInput>;
};

export const eventFormatFactory = (options: FactoryOptions) => {
  const { attributes = {}, event } = options;

  const defaultAttributes: Prisma.EventFormatCreateInput = {
    name: randCatchPhrase(),
    description: randText({ charCount: 100 }),
    event: { connect: { id: event.id } },
  };

  const data = { ...defaultAttributes, ...attributes };

  return db.eventFormat.create({ data });
};
