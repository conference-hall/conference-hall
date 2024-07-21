import {
  randAvatar,
  randCity,
  randCompanyName,
  randEmail,
  randFullName,
  randParagraph,
  randUserName,
} from '@ngneat/falso';
import type { Prisma } from '@prisma/client';

import { db } from '../../prisma/db.server.ts';
import { applyTraits } from './helpers/traits.ts';
import { organizerKeyFactory } from './organizer-key.ts';

const TRAITS = {
  'clark-kent': {
    name: 'Clark Kent',
    email: 'superman@example.com',
    picture: 'https://i.pravatar.cc/150?img=13',
  },
  'bruce-wayne': {
    name: 'Bruce Wayne',
    email: 'batman@example.com',
    picture: 'https://i.pravatar.cc/150?img=56',
  },
  'peter-parker': {
    name: 'Peter Parker',
    email: 'spiderman@example.com',
    picture: 'https://i.pravatar.cc/150?img=8',
  },
};

type Trait = keyof typeof TRAITS;

const AUTHENTICATION_METHOD_UIDs: Record<Trait, string> = {
  'clark-kent': '9licQdPND0UtBhShJ7vveJ703sJs',
  'bruce-wayne': 'e9HDr773xNpXbOy2H0C7FDhGD2fc',
  'peter-parker': 'tpSmd3FehZIM3Wp4HYSBnfnQmXLb',
};

type FactoryOptions = {
  attributes?: Partial<Prisma.UserCreateInput>;
  traits?: Trait[];
  isOrganizer?: boolean;
};

export const userFactory = async (options: FactoryOptions = {}) => {
  const { attributes = {}, traits = [], isOrganizer } = options;

  const defaultAttributes: Prisma.UserCreateInput = {
    name: randFullName(),
    email: randEmail(),
    picture: randAvatar(),
    location: randCity(),
    bio: randParagraph(),
    references: randParagraph(),
    company: randCompanyName(),
    socials: {
      github: randUserName(),
      twitter: randUserName(),
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

  const authTrait = traits.find((t) => Object.keys(AUTHENTICATION_METHOD_UIDs).includes(t));
  const uid = authTrait ? AUTHENTICATION_METHOD_UIDs[authTrait] : user.id;

  await db.authenticationMethod.create({
    data: {
      uid,
      name: user.name,
      email: user.email,
      picture: user.picture,
      provider: 'google.com',
      userId: user.id,
    },
  });

  return user;
};
