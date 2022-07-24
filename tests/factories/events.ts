import * as fake from '@ngneat/falso';
import type { Prisma } from '@prisma/client';
import { EventType, EventVisibility } from '@prisma/client';
import { db } from '../../app/services/db';
import { applyTraits } from './helpers/traits';

const TRAITS = {
  conference: {
    type: EventType.CONFERENCE,
    conferenceStart: '2091-11-20T00:00:00.000Z',
    conferenceEnd: '2091-11-21T00:00:00.000Z',
  },
  'conference-cfp-open': {
    type: EventType.CONFERENCE,
    cfpStart: '2020-10-05T14:48:00.000Z',
    cfpEnd: '2090-10-05T14:48:00.000Z',
  },
  'conference-cfp-past': {
    type: EventType.CONFERENCE,
    cfpStart: '2001-10-05T14:48:00.000Z',
    cfpEnd: '2001-10-05T14:48:00.000Z',
  },
  'conference-cfp-future': {
    type: EventType.CONFERENCE,
    cfpStart: '2100-10-05T14:48:00.000Z',
    cfpEnd: '2100-10-05T14:48:00.000Z',
  },
  meetup: {
    type: EventType.MEETUP,
  },
  'meetup-cfp-open': {
    type: EventType.MEETUP,
    cfpStart: '2020-10-05T14:48:00.000Z',
    cfpEnd: undefined,
  },
  'meetup-cfp-close': {
    type: EventType.MEETUP,
    cfpStart: undefined,
    cfpEnd: undefined,
  },
  private: {
    visibility: EventVisibility.PRIVATE,
  },
  archived: {
    archived: true,
  },
  withSurvey: {
    surveyEnabled: true,
    surveyQuestions: ['gender', 'tshirt', 'diet', 'accomodation', 'transports', 'info'],
  },
};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  attributes?: Partial<Prisma.EventCreateInput>;
  traits?: Trait[];
};

export const eventFactory = (options: FactoryOptions = {}) => {
  const { attributes = {}, traits = [] } = options;

  const defaultAttributes: Prisma.EventCreateInput = {
    name: fake.randSportsTeam(),
    slug: `slug-${fake.randUuid()}`,
    description: fake.randParagraph(),
    address: fake.randFullAddress(),
    bannerUrl: fake.randImg({ width: 1200, height: 300 }),
    websiteUrl: fake.randUrl(),
    contactEmail: fake.randEmail(),
    codeOfConductUrl: fake.randUrl(),
    type: fake.rand([EventType.CONFERENCE, EventType.MEETUP]),
    visibility: EventVisibility.PUBLIC,
    creator: { create: { name: fake.randFullName() } },
  };

  const data = {
    ...defaultAttributes,
    ...applyTraits(TRAITS, traits),
    ...attributes,
  };

  return db.event.create({ data });
};
