import { Prisma } from '@prisma/client';
import {
  randAvatar,
  randCity,
  randCompanyName,
  randEmail,
  randFullName,
  randParagraph,
  randUserName,
} from '@ngneat/falso';
import { createUserFactory } from '../../prisma/factories';
import { applyTraits } from './factories';

type Trait = 'auth-user-1';

const TRAITS: Record<Trait, Partial<Prisma.UserCreateInput>> = {
  'auth-user-1': { id: 'tpSmd3FehZIM3Wp4HYSBnfnQmXLb' },
};

export function UserFactory(...traits: Trait[]) {
  return createUserFactory({
    name: randFullName(),
    email: randEmail(),
    photoURL: randAvatar(),
    address: randCity(),
    bio: randParagraph(),
    references: randParagraph(),
    company: randCompanyName(),
    github: randUserName(),
    twitter: randUserName(),
    ...applyTraits(TRAITS, traits),
  });
}
