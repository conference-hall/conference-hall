import { randParagraph, randPost } from '@ngneat/falso';
import type { Event, EventCategory, EventFormat, EventProposalTag, Prisma, Talk, User } from '@prisma/client';
import { ConfirmationStatus, DeliberationStatus, PublicationStatus, TalkLevel } from '@prisma/client';
import { EventSpeaker } from '~/.server/shared/event-speaker.ts';
import { db } from '../../prisma/db.server.ts';
import { applyTraits } from './helpers/traits.ts';

export type ProposalFactory = Awaited<ReturnType<typeof proposalFactory>>;

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
  tags?: EventProposalTag[];
  attributes?: Partial<Prisma.ProposalCreateInput>;
  traits?: Trait[];
};

export const proposalFactory = async (options: FactoryOptions) => {
  const { attributes = {}, traits = [], talk, event, formats, categories, tags } = options;

  const newSpeakers = await EventSpeaker.for(event.id).upsertForUsers(talk.speakers);

  const defaultAttributes: Prisma.ProposalCreateInput = {
    title: talk?.title || randPost().title,
    abstract: talk?.abstract || randParagraph(),
    references: talk?.references || randParagraph(),
    languages: talk?.languages || ['en'],
    level: talk?.level || TalkLevel.INTERMEDIATE,
    talk: { connect: { id: talk.id } },
    newSpeakers: { connect: newSpeakers.map(({ id }) => ({ id })) },
    event: { connect: { id: event.id } },
    isDraft: false,
    createdAt: new Date(),
  };

  if (formats) {
    defaultAttributes.formats = { connect: formats.map(({ id }) => ({ id })) };
  }
  if (categories) {
    defaultAttributes.categories = { connect: categories.map(({ id }) => ({ id })) };
  }
  if (tags) {
    defaultAttributes.tags = { connect: tags.map(({ id }) => ({ id })) };
  }

  const data = {
    ...defaultAttributes,
    ...applyTraits(TRAITS, traits),
    ...attributes,
  };

  return db.proposal.create({ data, include: { event: true, newSpeakers: true } });
};
