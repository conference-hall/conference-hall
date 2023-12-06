import { randParagraph, randPost } from '@ngneat/falso';
import type { Event, EventCategory, EventFormat, Prisma, Talk, User } from '@prisma/client';
import { ConfirmationStatus, DeliberationStatus, TalkLevel } from '@prisma/client';

import { db } from '../../app/libs/db.ts';
import { applyTraits } from './helpers/traits.ts';

const TRAITS = {
  draft: { isDraft: true },
  submitted: { isDraft: false },
  accepted: { deliberationStatus: DeliberationStatus.ACCEPTED },
  rejected: { deliberationStatus: DeliberationStatus.REJECTED },
  declined: { deliberationStatus: DeliberationStatus.ACCEPTED, confirmationStatus: ConfirmationStatus.DECLINED },
  confirmed: { deliberationStatus: DeliberationStatus.ACCEPTED, confirmationStatus: ConfirmationStatus.CONFIRMED },
};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  event: Event;
  talk: Talk & { speakers: User[] };
  formats?: EventFormat[];
  categories?: EventCategory[];
  attributes?: Partial<Prisma.ProposalCreateInput>;
  traits?: Trait[];
  withResultPublished?: boolean;
};

export const proposalFactory = (options: FactoryOptions) => {
  const { attributes = {}, traits = [], talk, event, formats, categories, withResultPublished } = options;

  const defaultAttributes: Prisma.ProposalCreateInput = {
    title: talk?.title || randPost().title,
    abstract: talk?.abstract || randParagraph(),
    references: talk?.references || randParagraph(),
    languages: talk?.languages || ['en'],
    level: talk?.level || TalkLevel.INTERMEDIATE,
    talk: { connect: { id: talk.id } },
    speakers: { connect: talk.speakers.map(({ id }) => ({ id })) },
    event: { connect: { id: event.id } },
    isDraft: false,
  };

  if (formats) {
    defaultAttributes.formats = { connect: formats.map(({ id }) => ({ id })) };
  }
  if (categories) {
    defaultAttributes.categories = { connect: categories.map(({ id }) => ({ id })) };
  }
  if (withResultPublished) {
    defaultAttributes.result = { create: { type: 'ACCEPTED' } };
  }

  const data = {
    ...defaultAttributes,
    ...applyTraits(TRAITS, traits),
    ...attributes,
  };

  return db.proposal.create({ data, include: { event: true } });
};
