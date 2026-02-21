import { randAnimal, randHex } from '@ngneat/falso';
import { db } from '../../prisma/db.server.ts';
import type { Event } from '../../prisma/generated/client.ts';
import type { EventProposalTagCreateInput } from '../../prisma/generated/models.ts';

type FactoryOptions = {
  event: Event;
  attributes?: Partial<EventProposalTagCreateInput>;
};

export const eventProposalTagFactory = (options: FactoryOptions) => {
  const { attributes = {}, event } = options;

  const defaultAttributes: EventProposalTagCreateInput = {
    name: randAnimal(),
    color: randHex(),
    event: { connect: { id: event.id } },
  };

  const data = { ...defaultAttributes, ...attributes };

  return db.eventProposalTag.create({ data });
};
