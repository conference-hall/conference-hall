import type { User } from '@prisma/client';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';

import { db } from '~/libs/db';

import { TalksLibrary } from './TalksLibrary';
import { TalkSaveSchema } from './TalksLibrary.types';

describe('TalksLibrary', () => {
  let speaker: User;
  beforeEach(async () => {
    speaker = await userFactory();
  });

  describe('#list', () => {
    it('returns speaker talks list', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      await talkFactory({ speakers: [speaker], attributes: { archived: true } });

      const otherSpeaker = await userFactory();
      await talkFactory({ speakers: [otherSpeaker] });

      const result = await TalksLibrary.of(speaker.id).list();

      expect(result).toEqual([
        {
          id: talk.id,
          title: talk.title,
          archived: false,
          createdAt: talk.createdAt.toUTCString(),
          speakers: [{ id: speaker.id, name: speaker.name, picture: speaker.picture }],
        },
      ]);
    });

    it('returns talks when co-speaker', async () => {
      const owner = await userFactory();
      await talkFactory({ speakers: [owner] });

      const cospeaker = await userFactory();
      const talk = await talkFactory({ speakers: [owner, cospeaker] });

      const result = await TalksLibrary.of(cospeaker.id).list();

      expect(result.length).toBe(1);
      expect(result[0].id).toBe(talk.id);

      const speakerIds = result[0].speakers.map(({ id }) => id).sort();
      expect(speakerIds).toEqual([owner.id, cospeaker.id].sort());
    });

    it('returns archived talks when archived option is set', async () => {
      const speaker = await userFactory();
      await talkFactory({ speakers: [speaker] });
      const talk = await talkFactory({
        speakers: [speaker],
        attributes: { archived: true },
      });

      const result = await TalksLibrary.of(speaker.id).list({ archived: true });

      expect(result.length).toBe(1);
      expect(result[0].id).toBe(talk.id);
    });
  });

  describe('#add', () => {
    it('adds a talk in the library', async () => {
      const result = await TalksLibrary.of(speaker.id).add({
        title: 'Talk title',
        abstract: 'Talk abstract',
        references: 'Talk references',
        languages: ['fr'],
        level: 'ADVANCED',
      });

      const talk = await db.talk.findUnique({
        where: { id: result.id },
        include: { speakers: true },
      });

      expect(talk?.title).toBe('Talk title');
      expect(talk?.abstract).toBe('Talk abstract');
      expect(talk?.references).toBe('Talk references');
      expect(talk?.languages).toEqual(['fr']);
      expect(talk?.level).toBe('ADVANCED');
      expect(talk?.creatorId).toBe(speaker.id);
      expect(talk?.speakers[0].id).toBe(speaker.id);
    });
  });
});

describe('TalksLibrary types', () => {
  it('validates talk form data', async () => {
    const result = TalkSaveSchema.safeParse({
      title: 'Hello world',
      abstract: 'Welcome to the world!',
      references: 'This is my world.',
      languages: ['en', 'fr'],
      level: 'ADVANCED',
    });

    expect(result.success && result.data).toEqual({
      title: 'Hello world',
      abstract: 'Welcome to the world!',
      references: 'This is my world.',
      languages: ['en', 'fr'],
      level: 'ADVANCED',
    });
  });

  it('validates mandatory and format talk form data', async () => {
    const result = TalkSaveSchema.safeParse({
      title: '',
      abstract: '',
      level: 'BAD_VALUE',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const { fieldErrors } = result.error.flatten();
      expect(fieldErrors.title).toEqual(['String must contain at least 1 character(s)']);
      expect(fieldErrors.abstract).toEqual(['String must contain at least 1 character(s)']);
      expect(fieldErrors.level).toEqual([
        "Invalid enum value. Expected 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED', received 'BAD_VALUE'",
      ]);
    }
  });
});
