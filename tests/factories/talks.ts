import type { User } from 'prisma/generated/client.ts';
import type { TalkCreateInput } from 'prisma/generated/models.ts';
import { randLine, randPost } from '@ngneat/falso';
import { TalkLevel } from 'prisma/generated/client.ts';
import { db } from '../../prisma/db.server.ts';
import { applyTraits } from './helpers/traits.ts';

const TRAITS = {
  archived: {
    archived: true,
  },
};

type Trait = keyof typeof TRAITS;

type FactoryOptions = {
  speakers: User[];
  attributes?: Partial<TalkCreateInput>;
  traits?: Trait[];
};

export const talkFactory = (options: FactoryOptions) => {
  const { attributes = {}, traits = [], speakers } = options;

  const defaultAttributes: TalkCreateInput = {
    title: randPost().title,
    abstract: randLine({ lineCount: 5 }),
    references: randLine({ lineCount: 2 }),
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
