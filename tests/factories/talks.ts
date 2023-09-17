import { randParagraph, randPost } from '@ngneat/falso';
import type { Prisma, User } from '@prisma/client';
import { TalkLevel } from '@prisma/client';

import { db } from '../../app/libs/db.ts';
import { applyTraits } from './helpers/traits.ts';

const TRAITS = {
  archived: {
    archived: true,
  },
};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  speakers: User[];
  attributes?: Partial<Prisma.TalkCreateInput>;
  traits?: Trait[];
};

export const talkFactory = (options: FactoryOptions) => {
  const { attributes = {}, traits = [], speakers } = options;

  const defaultAttributes: Prisma.TalkCreateInput = {
    title: randPost().title,
    abstract: randParagraph(),
    references: randParagraph(),
    languages: ['en'],
    level: TalkLevel.INTERMEDIATE,
    creator: { connect: { id: speakers[0].id } },
    speakers: { connect: speakers.map(({ id }) => ({ id })) },
  };

  const data = {
    ...defaultAttributes,
    ...applyTraits(TRAITS, traits),
    ...attributes,
  };

  return db.talk.create({ data, include: { speakers: true } });
};
