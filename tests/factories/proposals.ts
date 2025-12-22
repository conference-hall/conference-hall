import { randParagraph, randPost } from '@ngneat/falso';
import type {
  Event,
  EventCategory,
  EventFormat,
  EventProposalTag,
  EventSpeaker,
  Talk,
  User,
} from 'prisma/generated/client.ts';
import { ConfirmationStatus, DeliberationStatus, PublicationStatus, TalkLevel } from 'prisma/generated/client.ts';
import type { ProposalCreateInput } from 'prisma/generated/models.ts';
import { EventSpeakerForProposal } from '~/features/event-participation/speaker-proposals/services/event-speaker-for-proposal.ts';
import { getNextProposalNumber } from '~/shared/counters/proposal-counter.server.ts';
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
  speakers?: EventSpeaker[];
  formats?: EventFormat[];
  categories?: EventCategory[];
  tags?: EventProposalTag[];
  attributes?: Partial<ProposalCreateInput>;
  traits?: Trait[];
};

export const proposalFactory = async (options: FactoryOptions) => {
  const { attributes = {}, traits = [], talk, event, speakers, formats, categories, tags } = options;

  const proposalSpeakers = speakers || (await EventSpeakerForProposal.for(event.id).upsertForUsers(talk.speakers));

  const defaultAttributes: ProposalCreateInput = {
    title: talk?.title || randPost().title,
    abstract: talk?.abstract || randParagraph(),
    references: talk?.references || randParagraph(),
    languages: talk?.languages || ['en'],
    level: talk?.level || TalkLevel.INTERMEDIATE,
    talk: { connect: { id: talk.id } },
    speakers: { connect: proposalSpeakers.map(({ id }) => ({ id })) },
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

  return db.$transaction(async (trx) => {
    if (!data.isDraft && !data.proposalNumber) {
      data.proposalNumber = await getNextProposalNumber(event.id, trx);
    }

    return trx.proposal.create({ data, include: { event: true, speakers: true } });
  });
};
