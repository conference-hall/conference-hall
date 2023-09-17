import { TalkLevel } from '@prisma/client';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.ts';

import { createTalk } from './create-talk.server.ts';

describe('#createTalk', () => {
  it('creates a speaker talk', async () => {
    const speaker = await userFactory();

    const talkId = await createTalk(speaker.id, {
      title: 'Talk title',
      abstract: 'Talk abstract',
      references: 'Talk references',
      languages: ['fr'],
      level: TalkLevel.ADVANCED,
    });

    const actual = await db.talk.findUnique({
      where: { id: talkId },
      include: { speakers: true },
    });

    expect(actual).not.toBeNull();
    expect(actual?.title).toBe('Talk title');
    expect(actual?.abstract).toBe('Talk abstract');
    expect(actual?.references).toBe('Talk references');
    expect(actual?.languages).toEqual(['fr']);
    expect(actual?.level).toEqual(TalkLevel.ADVANCED);
  });
});
