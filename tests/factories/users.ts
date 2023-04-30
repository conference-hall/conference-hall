import * as fake from '@ngneat/falso';
import type { Prisma } from '@prisma/client';
import { db } from '../../app/libs/db';
import { applyTraits } from './helpers/traits';
import { organizerKeyFactory } from './organizer-key';

const TRAITS = {
  'clark-kent': {
    id: '9licQdPND0UtBhShJ7vveJ703sJs',
    name: 'Clark Kent',
    email: 'superman@example.com',
    picture: 'https://s3.amazonaws.com/comicgeeks/characters/avatars/19.jpg',
  },
  'bruce-wayne': {
    id: 'e9HDr773xNpXbOy2H0C7FDhGD2fc',
    name: 'Bruce Wayne',
    email: 'batman@example.com',
    picture: 'http://multiversitystatic.s3.amazonaws.com/uploads/2013/02/Bruce-Wayne-Jordan-Gibson-Art-Of-The-Week.png',
  },
  'peter-parker': {
    id: 'tpSmd3FehZIM3Wp4HYSBnfnQmXLb',
    name: 'Peter Parker',
    email: 'spiderman@example.com',
    picture: 'https://www.mdcu-comics.fr/uploads/news/2020/09/news_illustre_1600620975_30.jpg',
  },
};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  attributes?: Partial<Prisma.UserCreateInput>;
  traits?: Trait[];
  isOrganizer?: boolean;
};

export const userFactory = async (options: FactoryOptions = {}) => {
  const { attributes = {}, traits = [], isOrganizer } = options;

  const defaultAttributes: Prisma.UserCreateInput = {
    name: fake.randFullName(),
    email: fake.randEmail(),
    picture: fake.randAvatar(),
    address: fake.randCity(),
    bio: fake.randParagraph(),
    references: fake.randParagraph(),
    company: fake.randCompanyName(),
    socials: {
      github: fake.randUserName(),
      twitter: fake.randUserName(),
    },
  };

  if (isOrganizer) {
    const key = await organizerKeyFactory();
    defaultAttributes.organizerKeyAccess = { connect: { id: key.id } };
  }

  const data = {
    ...defaultAttributes,
    ...applyTraits(TRAITS, traits),
    ...attributes,
  };

  const user = await db.user.create({ data });

  await db.account.create({
    data: {
      uid: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      provider: 'google',
      userId: user.id,
    },
  });

  return user;
};
