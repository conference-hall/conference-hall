import { randAnimal, randHex } from '@ngneat/falso';
import type { Event, Prisma } from '@prisma/client';

import { db } from '../../prisma/db.server.ts';

type FactoryOptions = {
  event: Event;
  attributes?: Partial<Prisma.EventProposalTagCreateInput>;
};

export const eventProposalTagFactory = (options: FactoryOptions) => {
  const { attributes = {}, event } = options;

  const defaultAttributes: Prisma.EventProposalTagCreateInput = {
    name: randAnimal(),
    color: randHex(),
    event: { connect: { id: event.id } },
  };

  const data = { ...defaultAttributes, ...attributes };

  return db.eventProposalTag.create({ data });
};
