import type { User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import { z } from 'zod';
import { TalkSaveSchema } from './talks-library.schema.server.ts';
import { TalksLibrary } from './talks-library.server.ts';

describe('TalksLibrary', () => {
  let speakerUser: User;

  beforeEach(async () => {
    speakerUser = await userFactory();
  });

  describe('#list', () => {
    it('returns speaker talks list', async () => {
      const talk = await talkFactory({ speakers: [speakerUser] });
      await talkFactory({ speakers: [speakerUser], attributes: { archived: true } });

      const otherSpeaker = await userFactory();
      await talkFactory({ speakers: [otherSpeaker] });

      const result = await TalksLibrary.of(speakerUser.id).list();

      expect(result).toEqual([
        {
          id: talk.id,
          title: talk.title,
          archived: false,
          createdAt: talk.createdAt,
          speakers: [{ userId: speakerUser.id, name: speakerUser.name, picture: speakerUser.picture }],
        },
      ]);
    });

    it('returns talks when co-speaker', async () => {
      const owner = await userFactory();
      await talkFactory({ speakers: [owner] });

      const cospeakerUser = await userFactory();
      const talk = await talkFactory({ speakers: [owner, cospeakerUser] });

      const result = await TalksLibrary.of(cospeakerUser.id).list();

      expect(result.length).toBe(1);
      expect(result[0].id).toBe(talk.id);

      const speakerIds = result[0].speakers.map(({ userId }) => userId).sort();
      expect(speakerIds).toEqual([owner.id, cospeakerUser.id].sort());
    });

    it('returns archived talks when "archived" filter is set', async () => {
      await talkFactory({ speakers: [speakerUser] });
      const talk = await talkFactory({
        speakers: [speakerUser],
        attributes: { archived: true },
      });

      const result = await TalksLibrary.of(speakerUser.id).list('archived');

      expect(result.length).toBe(1);
      expect(result[0].id).toBe(talk.id);
    });

    it('returns active and archived talks when "all" filter is set', async () => {
      const talk = await talkFactory({ speakers: [speakerUser] });
      const talkArchived = await talkFactory({
        speakers: [speakerUser],
        attributes: { archived: true },
      });

      const result = await TalksLibrary.of(speakerUser.id).list('all');

      expect(result.length).toBe(2);
      expect(result[0].id).toBe(talkArchived.id);
      expect(result[1].id).toBe(talk.id);
    });
  });

  describe('#listForEvent', () => {
    it('returns talks eligible for the event', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const otherSpeakerUser = await userFactory();

      // other speaker talk (not returned)
      await talkFactory({ speakers: [otherSpeakerUser] });
      // archived talk (not returned)
      await talkFactory({ speakers: [speakerUser], traits: ['archived'] });
      // talk submitted (not returned)
      const talk1 = await talkFactory({ speakers: [speakerUser] });
      await proposalFactory({ event, talk: talk1 });
      // not submitted talk (expected)
      const talk2 = await talkFactory({ speakers: [speakerUser] });

      const result = await TalksLibrary.of(speakerUser.id).listForEvent(event.slug);

      expect(result).toEqual([
        {
          id: talk2.id,
          title: talk2.title,
          speakers: [{ userId: speakerUser.id, name: speakerUser.name, picture: speakerUser.picture }],
        },
      ]);
    });
  });

  describe('#add', () => {
    it('adds a talk in the library', async () => {
      const talk = await TalksLibrary.of(speakerUser.id).add({
        title: 'Talk title',
        abstract: 'Talk abstract',
        references: 'Talk references',
        languages: ['fr'],
        level: 'ADVANCED',
      });

      expect(talk?.title).toBe('Talk title');
      expect(talk?.abstract).toBe('Talk abstract');
      expect(talk?.references).toBe('Talk references');
      expect(talk?.languages).toEqual(['fr']);
      expect(talk?.level).toBe('ADVANCED');
      expect(talk?.creatorId).toBe(speakerUser.id);
      expect(talk?.speakers[0].id).toBe(speakerUser.id);
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
      const { fieldErrors } = z.flattenError(result.error!);
      expect(fieldErrors.title).toEqual(['Too small: expected string to have >=1 characters']);
      expect(fieldErrors.abstract).toEqual(['Too small: expected string to have >=1 characters']);
      expect(fieldErrors.level).toEqual(['Invalid option: expected one of "BEGINNER"|"INTERMEDIATE"|"ADVANCED"']);
    }
  });
});
