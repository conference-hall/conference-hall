import { randAvatar, randCity, randCompanyName, randEmail, randFullName, randParagraph, randUrl } from '@ngneat/falso';
import type { Prisma } from '@prisma/client';

import { db } from '../../prisma/db.server.ts';
import { applyTraits } from './helpers/traits.ts';
import { organizerKeyFactory } from './organizer-key.ts';

const TRAITS = {
  'clark-kent': {
    id: '9licQdPND0UtBhShJ7vveJ703sJs',
    uid: '9licQdPND0UtBhShJ7vveJ703sJs',
    name: 'Clark Kent',
    email: 'superman@example.com',
    picture: 'https://i.pravatar.cc/150?img=13',
  },
  'bruce-wayne': {
    id: 'e9HDr773xNpXbOy2H0C7FDhGD2fc',
    uid: 'e9HDr773xNpXbOy2H0C7FDhGD2fc',
    name: 'Bruce Wayne',
    email: 'batman@example.com',
    picture: 'https://i.pravatar.cc/150?img=56',
  },
  'peter-parker': {
    id: 'tpSmd3FehZIM3Wp4HYSBnfnQmXLb',
    uid: 'tpSmd3FehZIM3Wp4HYSBnfnQmXLb',
    name: 'Peter Parker',
    email: 'spiderman@example.com',
    picture: 'https://i.pravatar.cc/150?img=8',
  },
  admin: {
    admin: true,
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
    name: randFullName(),
    email: randEmail(),
    picture: randAvatar(),
    location: randCity(),
    bio: randParagraph(),
    references: randParagraph(),
    company: randCompanyName(),
    socialLinks: [randUrl(), randUrl()],
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

  return db.user.create({ data });
};
