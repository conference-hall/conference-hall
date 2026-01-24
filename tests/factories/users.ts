import { randAvatar, randCity, randCompanyName, randEmail, randFullName, randParagraph, randUrl } from '@ngneat/falso';
import { hashPassword } from 'better-auth/crypto';
import { db } from '../../prisma/db.server.ts';
import type { UserCreateInput } from '../../prisma/generated/models.ts';
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
  admin: {
    admin: true,
  },
};

type Trait = keyof typeof TRAITS;

export const DEFAULT_PASSWORD = 'password';

export type UserFactoryOptions = {
  attributes?: Partial<UserCreateInput>;
  traits?: Trait[];
  isOrganizer?: boolean;
  withPasswordAccount?: boolean;
  withSocialAccount?: boolean;
};

export const userFactory = async (options: UserFactoryOptions = {}) => {
  const { attributes = {}, traits = [], isOrganizer, withPasswordAccount, withSocialAccount } = options;

  const defaultAttributes: UserCreateInput = {
    name: randFullName(),
    email: randEmail(),
    picture: randAvatar(),
    location: randCity(),
    bio: randParagraph(),
    references: randParagraph(),
    company: randCompanyName(),
    socialLinks: [randUrl(), randUrl()],
    emailVerified: true,
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

  if (withPasswordAccount) {
    const isTestEnv = process.env.NODE_ENV === 'test';
    const password = isTestEnv ? DEFAULT_PASSWORD : await hashPassword(DEFAULT_PASSWORD);
    await db.account.create({ data: { accountId: user.id, providerId: 'credential', userId: user.id, password } });
  }
  if (withSocialAccount) {
    await db.account.create({ data: { accountId: user.id, providerId: 'google', userId: user.id } });
  }

  return user;
};
