import { randParagraph, randPost } from '@ngneat/falso';
import type { Event, EventCategory, EventFormat, Prisma, Talk, User } from '@prisma/client';
import { EmailStatus, ProposalStatus, TalkLevel } from '@prisma/client';

import { db } from '../../app/libs/db.ts';
import { applyTraits } from './helpers/traits.ts';

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
