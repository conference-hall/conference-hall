import { randSportsTeam, randUuid } from '@ngneat/falso';
import type { Prisma, User } from '@prisma/client';
import { TeamRole } from '@prisma/client';

import { db } from '../../app/libs/db.ts';
import { applyTraits } from './helpers/traits.ts';

const { OWNER, MEMBER, REVIEWER } = TeamRole;

const TRAITS = {};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  attributes?: Partial<Prisma.TeamCreateInput>;
  traits?: Trait[];
  owners?: Array<User>;
  members?: Array<User>;
  reviewers?: Array<User>;
};

function createTeamMembers({ owners = [], members = [], reviewers = [] }: FactoryOptions) {
  return [
    ...owners.map((u) => ({ role: OWNER, member: { connect: { id: u.id } } })),
    ...members.map((u) => ({ role: MEMBER, member: { connect: { id: u.id } } })),
    ...reviewers.map((u) => ({ role: REVIEWER, member: { connect: { id: u.id } } })),
  ];
}

export const teamFactory = async (options: FactoryOptions = {}) => {
  const { attributes = {}, traits = [] } = options;

  const defaultAttributes: Prisma.TeamCreateInput = {
    name: randSportsTeam(),
    slug: `slug-${randUuid()}`,
  };

  const data = {
    ...defaultAttributes,
    ...applyTraits(TRAITS, traits),
    ...attributes,
  };

  const members = createTeamMembers(options);
  if (members.length > 0) {
    data.members = { create: members };
  }

  return db.team.create({ data });
};
