import { rand, randAnimal, randEmail, randFullAddress, randParagraph, randText, randUrl } from '@ngneat/falso';
import { slugifyWithCounter } from '@sindresorhus/slugify';
import { generateImagePlaceholder } from 'tests/img-placeholder.ts';
import { getRandomColor } from '~/shared/colors/colors.ts';
import type { Team, User } from '../../prisma/generated/client.ts';
import type { EventCreateInput } from '../../prisma/generated/models.ts';
import { db } from '../../prisma/db.server.ts';
import { EventType, EventVisibility } from '../../prisma/generated/client.ts';
import { applyTraits } from './helpers/traits.ts';
import { teamFactory } from './team.ts';
import { userFactory } from './users.ts';

const slugify = slugifyWithCounter();

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
  withSurveyConfig: {
    surveyConfig: {
      enabled: true,
      questions: [
        {
          id: 'accomodation',
          label: 'Do you need accommodation funding? (Hotel, AirBnB...)',
          type: 'radio',
          required: false,
          options: [
            { id: 'yes', label: 'Yes' },
            { id: 'no', label: 'No' },
          ],
        },
        {
          id: 'transports',
          label: 'Do you need transports funding?',
          type: 'checkbox',
          required: false,
          options: [
            { id: 'taxi', label: 'Taxi' },
            { id: 'train', label: 'Train' },
            { id: 'plane', label: 'Plane' },
          ],
        },
        {
          id: 'info',
          label: 'Do you have specific information to share?',
          type: 'text',
          required: false,
        },
      ],
    },
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
        configuration: { eventId: 'open-planner-event-id', apiKey: 'open-planner-api-key' },
      },
    },
  },
};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  attributes?: Partial<EventCreateInput>;
  traits?: Trait[];
  team?: Team;
  creator?: User;
};

export const eventFactory = async (options: FactoryOptions = {}) => {
  const { attributes = {}, traits = [] } = options;

  if (!options.team) {
    options.team = await teamFactory();
  }

  const creator = options.creator ? options.creator : await userFactory();

  const name = attributes.name || randAnimal();
  const slug = slugify(name);
  const backgroundColor = getRandomColor();

  const defaultAttributes: EventCreateInput = {
    name,
    slug,
    description: randParagraph(),
    timezone: 'Europe/Paris',
    location: randFullAddress(),
    logoUrl: generateImagePlaceholder({ height: 128, width: 128, backgroundColor }),
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
