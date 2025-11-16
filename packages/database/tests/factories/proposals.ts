import type { SocialLinks } from '@conference-hall/shared/types/speaker.types.ts';
import { randParagraph, randPost } from '@ngneat/falso';
import type {
  Event,
  EventCategory,
  EventFormat,
  EventProposalTag,
  EventSpeaker,
  Prisma,
  Talk,
  User,
} from '../../index.ts';
import { ConfirmationStatus, DeliberationStatus, db, PublicationStatus, TalkLevel } from '../../index.ts';
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
  attributes?: Partial<Prisma.ProposalCreateInput>;
  traits?: Trait[];
};

export const proposalFactory = async (options: FactoryOptions) => {
  const { attributes = {}, traits = [], talk, event, speakers, formats, categories, tags } = options;

  const proposalSpeakers = speakers || [];
  if (!speakers) {
    for (const speaker of talk.speakers) {
      proposalSpeakers.push(await saveEventSpeaker(event.id, speaker));
    }
  }

  const defaultAttributes: Prisma.ProposalCreateInput = {
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

  return db.proposal.create({ data, include: { event: true, speakers: true } });
};

async function saveEventSpeaker(eventId: string, user: User) {
  const speaker = await db.eventSpeaker.findFirst({ where: { userId: user.id, eventId } });
  if (speaker) return speaker;

  return db.eventSpeaker.create({
    data: {
      userId: user.id,
      eventId: eventId,
      email: user.email,
      name: user.name,
      picture: user.picture,
      bio: user.bio,
      references: user.references,
      company: user.company,
      location: user.location,
      socialLinks: user.socialLinks as SocialLinks,
      locale: user.locale,
    },
  });
}
