import { TalkLevel } from '@prisma/client';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.ts';
import { TalkNotFoundError } from '~/libs/errors.ts';

import { updateTalk } from './update-talk.server.ts';

describe('#updateTalk', () => {
  it('updates a speaker talk', async () => {
    const speaker = await userFactory();

    const { id: talkId } = await talkFactory({
      speakers: [speaker],
      attributes: {
        title: 'Talk title',
        abstract: 'Talk abstract',
        references: 'Talk references',
        languages: ['fr'],
        level: TalkLevel.ADVANCED,
      },
    });

    const talk = await db.talk.findUnique({
      where: { id: talkId },
      include: { speakers: true },
    });

    expect(talk?.title).toBe('Talk title');
    expect(talk?.abstract).toBe('Talk abstract');
    expect(talk?.references).toBe('Talk references');
    expect(talk?.languages).toEqual(['fr']);
    expect(talk?.level).toEqual(TalkLevel.ADVANCED);
    expect(talk?.speakers[0].id).toBe(speaker.id);
  });

  it('throws an error when talk does not belong to the speaker', async () => {
    const speaker = await userFactory();
    const otherSpeaker = await userFactory();
    const talk = await talkFactory({ speakers: [otherSpeaker] });
    const updateData = {
      title: 'Talk title',
      abstract: 'Talk abstract',
      references: 'Talk references',
      languages: ['fr'],
      level: TalkLevel.ADVANCED,
    };
    await expect(updateTalk(speaker.id, talk.id, updateData)).rejects.toThrowError(TalkNotFoundError);
  });

  it('throws an error when talk not found', async () => {
    const speaker = await userFactory();
    const updateData = {
      title: 'Talk title',
      abstract: 'Talk abstract',
      references: 'Talk references',
      languages: ['fr'],
      level: TalkLevel.ADVANCED,
    };
    await expect(updateTalk(speaker.id, 'XXX', updateData)).rejects.toThrowError(TalkNotFoundError);
  });
});
