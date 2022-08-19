import * as fake from '@ngneat/falso';
import type { Prisma } from '@prisma/client';
import { db } from '../../app/services/db';
import { applyTraits } from './helpers/traits';

const TRAITS = {
  'clark-kent': {
    id: '9licQdPND0UtBhShJ7vveJ703sJs',
    name: 'Clark Kent',
    email: 'superman@example.com',
    photoURL: 'https://s3.amazonaws.com/comicgeeks/characters/avatars/19.jpg',
  },
  'bruce-wayne': {
    id: 'e9HDr773xNpXbOy2H0C7FDhGD2fc',
    name: 'Bruce Wayne',
    email: 'batman@example.com',
    photoURL:
      'http://multiversitystatic.s3.amazonaws.com/uploads/2013/02/Bruce-Wayne-Jordan-Gibson-Art-Of-The-Week.png',
  },
};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  attributes?: Partial<Prisma.UserCreateInput>;
  traits?: Trait[];
};

export const userFactory = (options: FactoryOptions = {}) => {
  const { attributes = {}, traits = [] } = options;

  const defaultAttributes = {
    name: fake.randFullName(),
    email: fake.randEmail(),
    photoURL: fake.randAvatar(),
    address: fake.randCity(),
    bio: fake.randParagraph(),
    references: fake.randParagraph(),
    company: fake.randCompanyName(),
    github: fake.randUserName(),
    twitter: fake.randUserName(),
  };

  const data = {
    ...defaultAttributes,
    ...applyTraits(TRAITS, traits),
    ...attributes,
  };

  return db.user.create({ data });
};
