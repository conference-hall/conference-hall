import { TalkLevel } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { userFactory } from 'tests/factories/users';
import { db } from '../../../libs/db';
import { createTalk } from './create-talk.server';

describe('#createTalk', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

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
