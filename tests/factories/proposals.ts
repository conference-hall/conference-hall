import { randParagraph, randPost } from '@ngneat/falso';
import type { Event, EventCategory, EventFormat, Prisma, Talk, User } from '@prisma/client';
import { ConfirmationStatus, DeliberationStatus, PublicationStatus, TalkLevel } from '@prisma/client';

import { db } from '../../prisma/db.server.ts';
import { applyTraits } from './helpers/traits.ts';

const TRAITS = {
  draft: { isDraft: true },
  accepted: { deliberationStatus: DeliberationStatus.ACCEPTED },
  rejected: { deliberationStatus: DeliberationStatus.REJECTED },
  declined: {
    deliberationStatus: DeliberationStatus.ACCEPTED,
    publicationStatus: PublicationStatus.PUBLISHED,
    confirmationStatus: ConfirmationStatus.DECLINED,
  },
  confirmed: {
    deliberationStatus: DeliberationStatus.ACCEPTED,
    publicationStatus: PublicationStatus.PUBLISHED,
    confirmationStatus: ConfirmationStatus.CONFIRMED,
  },
  'accepted-published': {
    deliberationStatus: DeliberationStatus.ACCEPTED,
    publicationStatus: PublicationStatus.PUBLISHED,
    confirmationStatus: ConfirmationStatus.PENDING,
  },
  'rejected-published': {
    deliberationStatus: DeliberationStatus.REJECTED,
    publicationStatus: PublicationStatus.PUBLISHED,
    confirmationStatus: ConfirmationStatus.PENDING,
  },
};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  event: Event;
  talk: Talk & { speakers: User[] };
  formats?: EventFormat[];
  categories?: EventCategory[];
  attributes?: Partial<Prisma.ProposalCreateInput>;
  traits?: Trait[];
};

export const proposalFactory = (options: FactoryOptions) => {
  const { attributes = {}, traits = [], talk, event, formats, categories } = options;

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

  const data = {
    ...defaultAttributes,
    ...applyTraits(TRAITS, traits),
    ...attributes,
  };

  return db.proposal.create({ data, include: { event: true } });
};
