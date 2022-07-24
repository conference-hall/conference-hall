import * as fake from '@ngneat/falso';
import { Prisma } from '@prisma/client';
import { db } from '../../app/services/db';
import { applyTraits } from './helpers/traits';

const TRAITS = {
  'auth-user-1': { id: 'tpSmd3FehZIM3Wp4HYSBnfnQmXLb' },
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
