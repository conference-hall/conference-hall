import {
  rand,
  randEmail,
  randFullAddress,
  randParagraph,
  randSportsTeam,
  randText,
  randUrl,
  randUuid,
} from '@ngneat/falso';
import type { Prisma, Team } from '@prisma/client';
import { EventType, EventVisibility } from '@prisma/client';

import { db } from '../../prisma/db.server.ts';
import { applyTraits } from './helpers/traits.ts';
import { teamFactory } from './team.ts';
import { userFactory } from './users.ts';

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
  withSchedule: {
    schedules: {
      create: {
        name: randText(),
        timezone: 'Europe/Paris',
        start: '2024-10-05T00:00:00.000Z',
        end: '2024-10-06T00:00:00.000Z',
        displayStartMinutes: 9 * 60,
        displayEndMinutes: 18 * 60,
      },
    },
  },
  withIntegration: {
    integrations: {
      create: {
        name: 'OPEN_PLANNER',
        configuration: { eventId: randUuid(), apiKey: randUuid() },
      },
    },
  },
};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  attributes?: Partial<Prisma.EventCreateInput>;
  traits?: Trait[];
  team?: Team;
};

export const eventFactory = async (options: FactoryOptions = {}) => {
  const { attributes = {}, traits = [] } = options;

  if (!options.team) {
    options.team = await teamFactory();
  }

  const creator = await userFactory();

  const defaultAttributes: Prisma.EventCreateInput = {
    name: randSportsTeam(),
    slug: `slug-${randUuid()}`,
    description: randParagraph(),
    timezone: 'Europe/Paris',
    location: randFullAddress(),
    logoUrl: `https://picsum.photos/seed/${randUuid()}/128`,
    websiteUrl: randUrl(),
    contactEmail: randEmail(),
    codeOfConductUrl: randUrl(),
    type: rand([EventType.CONFERENCE, EventType.MEETUP]),
    visibility: EventVisibility.PUBLIC,
    creator: { connect: { id: creator.id } },
    team: { connect: { id: options.team?.id } },
  };

  const data = {
    ...defaultAttributes,
    ...applyTraits(TRAITS, traits),
    ...attributes,
  };

  return db.event.create({ data });
};
