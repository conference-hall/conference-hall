import { randParagraph, randText } from '@ngneat/falso';
import type { Event } from '../../prisma/generated/client.ts';
import type { EventEmailCustomizationCreateInput } from '../../prisma/generated/models.ts';
import { db } from '../../prisma/db.server.ts';
import { eventFactory } from './events.ts';
import { applyTraits } from './helpers/traits.ts';

const TRAITS = {
  'speakers-proposal-submitted': { template: 'speakers-proposal-submitted' },
  'speakers-proposal-accepted': { template: 'speakers-proposal-accepted' },
  'speakers-proposal-rejected': { template: 'speakers-proposal-rejected' },
  french: { locale: 'fr' },
  'with-all-fields': {
    subject: 'Custom Subject',
    content: 'Custom markdown content',
  },
};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  attributes?: Partial<EventEmailCustomizationCreateInput>;
  traits?: Trait[];
  event?: Event;
};

export const eventEmailCustomizationFactory = async (options: FactoryOptions = {}) => {
  const { attributes = {}, traits = [] } = options;

  if (!options.event) {
    options.event = await eventFactory();
  }

  const defaultAttributes: EventEmailCustomizationCreateInput = {
    template: 'speakers-proposal-submitted',
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
