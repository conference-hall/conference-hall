import * as fake from '@ngneat/falso';
import { Prisma, TalkLevel } from '@prisma/client';
import { db } from '../../app/services/db';
import { applyTraits } from './helpers/traits';
import { UserFactory } from './users';

const TRAITS = {
  'auth-user-1': { id: 'tpSmd3FehZIM3Wp4HYSBnfnQmXLb' },
};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  attributes?: Partial<Prisma.TalkCreateInput>;
  traits?: Trait[];
  withSpeakers?: string[];
};

export const TalkFactory = {
  build: (options: FactoryOptions = {}) => {
    const { attributes = {}, traits = [], withSpeakers } = options;

    const creator = UserFactory.build();

    const defaultAttributes: Prisma.TalkCreateInput = {
      title: fake.randPost().title,
      abstract: fake.randParagraph(),
      references: fake.randParagraph(),
      languages: ['en'],
      level: TalkLevel.INTERMEDIATE,
      creator: { connectOrCreate: { create: creator, where: { id: creator.id } } },
      speakers: { connectOrCreate: { create: creator, where: { id: creator.id } } },
    };

    if (withSpeakers) {
      defaultAttributes.creator = { connect: { id: withSpeakers[0] } };
      defaultAttributes.speakers = { connect: withSpeakers.map(id => ({ id })) };
    }

    return { ...defaultAttributes, ...applyTraits(TRAITS, traits), ...attributes };
  },
  create: (options: FactoryOptions = {}) => {
    const data = TalkFactory.build(options);
    return db.talk.create({ data });
  },
};
