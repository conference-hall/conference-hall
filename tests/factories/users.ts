import crypto from 'node:crypto';
import { randAvatar, randCity, randCompanyName, randEmail, randFullName, randParagraph, randUrl } from '@ngneat/falso';
import { hashPassword } from 'better-auth/crypto';
import { db } from '../../prisma/db.server.ts';
import type { UserCreateInput } from '../../prisma/generated/models.ts';
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

export const DEFAULT_PASSWORD = 'password';
const SESSION_EXPIRES_AT = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
const SESSION_TOKEN = '00000000000000000000000000000000';

type FactoryOptions = {
  attributes?: Partial<UserCreateInput>;
  traits?: Trait[];
  isOrganizer?: boolean;
  withPasswordAccount?: boolean;
  withSocialAccount?: boolean;
  withAuthSession?: boolean;
};

export const userFactory = async (options: FactoryOptions = {}) => {
  const {
    attributes = {},
    traits = [],
    isOrganizer,
    withPasswordAccount,
    withSocialAccount,
    withAuthSession,
  } = options;

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
  if (withAuthSession) {
    await db.session.create({ data: { token: SESSION_TOKEN, userId: user.id, expiresAt: SESSION_EXPIRES_AT } });
  }

  return user;
};

export function getAuthSessionCookie() {
  const signature = crypto.createHmac('sha256', process.env.BETTER_AUTH_SECRET!).update(SESSION_TOKEN).digest('base64');
  const signedValue = `${SESSION_TOKEN}.${signature}`;
  return {
    name: 'better-auth.session_token',
    value: encodeURIComponent(signedValue),
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
    expires: Math.round(SESSION_EXPIRES_AT.getTime() / 1000),
  };
}
