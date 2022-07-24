import * as fake from '@ngneat/falso';
import type { Event, Prisma, Talk, User } from '@prisma/client';
import { ProposalStatus, TalkLevel } from '@prisma/client';
import { db } from '../../app/services/db';
import { applyTraits } from './helpers/traits';

const TRAITS = {
  draft: { status: ProposalStatus.DRAFT },
  accepted: { status: ProposalStatus.ACCEPTED },
  rejected: { status: ProposalStatus.REJECTED },
  submitted: { status: ProposalStatus.SUBMITTED },
};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  event: Event;
  talk: Talk & { speakers: User[] };
  attributes?: Partial<Prisma.ProposalCreateInput>;
  traits?: Trait[];
};

export const proposalFactory = (options: FactoryOptions) => {
  const { attributes = {}, traits = [], talk, event } = options;

  const defaultAttributes: Prisma.ProposalCreateInput = {
    title: fake.randPost().title,
    abstract: fake.randParagraph(),
    references: fake.randParagraph(),
    languages: ['en'],
    level: TalkLevel.INTERMEDIATE,
    status: ProposalStatus.SUBMITTED,
    talk: { connect: { id: talk.id } },
    speakers: { connect: talk.speakers.map(({ id }) => ({ id })) },
    event: { connect: { id: event.id } },
  };

  const data = {
    ...defaultAttributes,
    ...applyTraits(TRAITS, traits),
    ...attributes,
  };

  return db.proposal.create({ data, include: { event: true } });
};
