import * as fake from '@ngneat/falso';
import type { Event, EventCategory, EventFormat, Prisma, Talk, User } from '@prisma/client';
import { EmailStatus } from '@prisma/client';
import { ProposalStatus, TalkLevel } from '@prisma/client';

import { db } from '../../app/libs/db';
import { applyTraits } from './helpers/traits';

const TRAITS = {
  draft: { status: ProposalStatus.DRAFT },
  submitted: { status: ProposalStatus.SUBMITTED },
  accepted: { status: ProposalStatus.ACCEPTED },
  acceptedAndNotified: { status: ProposalStatus.ACCEPTED, emailAcceptedStatus: EmailStatus.SENT },
  rejected: { status: ProposalStatus.REJECTED },
  rejectedAndNotified: { status: ProposalStatus.REJECTED, emailRejectedStatus: EmailStatus.SENT },
  declined: { status: ProposalStatus.DECLINED },
  confirmed: { status: ProposalStatus.CONFIRMED },
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
    title: talk?.title || fake.randPost().title,
    abstract: talk?.abstract || fake.randParagraph(),
    references: talk?.references || fake.randParagraph(),
    languages: talk?.languages || ['en'],
    level: talk?.level || TalkLevel.INTERMEDIATE,
    status: ProposalStatus.SUBMITTED,
    talk: { connect: { id: talk.id } },
    speakers: { connect: talk.speakers.map(({ id }) => ({ id })) },
    event: { connect: { id: event.id } },
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
