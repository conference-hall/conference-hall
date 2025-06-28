import { randParagraph, randText } from '@ngneat/falso';
import type { Event, Prisma } from '@prisma/client';
import { db } from '../../prisma/db.server.ts';
import { eventFactory } from './events.ts';
import { applyTraits } from './helpers/traits.ts';

const TRAITS = {
  'proposal-submitted': { template: 'proposal-submitted' },
  'proposal-accepted': { template: 'proposal-accepted' },
  'proposal-declined': { template: 'proposal-declined' },
  french: { locale: 'fr' },
  'with-all-fields': {
    subject: 'Custom Subject',
    content: 'Custom markdown content',
    signature: 'Best regards,\\nThe Team',
  },
};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  attributes?: Partial<Prisma.EventEmailCustomizationCreateInput>;
  traits?: Trait[];
  event?: Event;
};

export const eventEmailCustomizationFactory = async (options: FactoryOptions = {}) => {
  const { attributes = {}, traits = [] } = options;

  if (!options.event) {
    options.event = await eventFactory();
  }

  const defaultAttributes: Prisma.EventEmailCustomizationCreateInput = {
    template: 'proposal-submitted',
    locale: 'en',
    subject: randText(),
    content: randParagraph(),
    event: { connect: { id: options.event.id } },
  };

  const data = {
    ...defaultAttributes,
    ...applyTraits(TRAITS, traits),
    ...attributes,
  };

  return db.eventEmailCustomization.create({ data });
};
