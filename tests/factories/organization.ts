import * as fake from '@ngneat/falso';
import type { Prisma } from '@prisma/client';
import { db } from '../../app/services/db';
import { applyTraits } from './helpers/traits';

const TRAITS = {};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  attributes?: Partial<Prisma.OrganizationCreateInput>;
  traits?: Trait[];
};

export const organizationFactory = (options: FactoryOptions = {}) => {
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

  return db.organization.create({ data });
};
