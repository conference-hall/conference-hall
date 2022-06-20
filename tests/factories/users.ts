import * as fake from '@ngneat/falso';
import { Prisma } from '@prisma/client';
import { db } from '../../app/services/db';
import { applyTraits } from './helpers/traits';

const TRAITS = {
  'auth-user-1': { id: 'tpSmd3FehZIM3Wp4HYSBnfnQmXLb' },
};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  attributes?: Partial<Prisma.UserCreateInput>,
  traits?: Trait[],
}

export const UserFactory = {
  build: (options: FactoryOptions = {}) => {
    const { attributes = {}, traits = [] } = options;

    const defaultAttributes = {
      id: fake.randUuid(),
      name: fake.randFullName(),
      email: fake.randEmail(),
      photoURL: fake.randAvatar(),
      address: fake.randCity(),
      bio: fake.randParagraph(),
      references: fake.randParagraph(),
      company: fake.randCompanyName(),
      github: fake.randUserName(),
      twitter: fake.randUserName(),
    }

    return { ...defaultAttributes, ...applyTraits(TRAITS, traits), ...attributes };
  },
  create: (options: FactoryOptions = {}) => {
    const data = UserFactory.build(options);
    return db.user.create({ data })
  }
}
