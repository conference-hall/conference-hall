import * as fake from '@ngneat/falso';
import type { Prisma, User } from '@prisma/client';
import { OrganizationRole } from '@prisma/client';
import { db } from '../../app/services/db';
import { applyTraits } from './helpers/traits';

const { OWNER, MEMBER, REVIEWER } = OrganizationRole;

const TRAITS = {};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  attributes?: Partial<Prisma.OrganizationCreateInput>;
  traits?: Trait[];
  owners?: Array<User>;
  members?: Array<User>;
  reviewers?: Array<User>;
};

function createOrgaMembers({ owners = [], members = [], reviewers = [] }: FactoryOptions) {
  return [
    ...owners.map((u) => ({ role: OWNER, member: { connect: { id: u.id } } })),
    ...members.map((u) => ({ role: MEMBER, member: { connect: { id: u.id } } })),
    ...reviewers.map((u) => ({ role: REVIEWER, member: { connect: { id: u.id } } })),
  ];
}

export const organizationFactory = async (options: FactoryOptions = {}) => {
  const { attributes = {}, traits = [] } = options;

  const defaultAttributes: Prisma.OrganizationCreateInput = {
    name: fake.randSportsTeam(),
    slug: `slug-${fake.randUuid()}`,
  };

  const data = {
    ...defaultAttributes,
    ...applyTraits(TRAITS, traits),
    ...attributes,
  };

  const members = createOrgaMembers(options);
  if (members.length > 0) {
    data.members = { create: members };
  }

  return db.organization.create({ data });
};
