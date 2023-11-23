import type { User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';

import { config } from '~/libs/config';
import { db } from '~/libs/db';
import { TalkNotFoundError } from '~/libs/errors';
import { SpeakerProposalStatus } from '~/routes/__server/proposals/get-speaker-proposal-status';

import { TalksLibrary } from './TalksLibrary';

describe('TalksLibrary', () => {
  let speaker: User;
  beforeEach(async () => {
    speaker = await userFactory();
  });

  describe('get', () => {
    it('returns speaker talk', async () => {
      const talk = await talkFactory({ speakers: [speaker] });

      const result = await TalksLibrary.for(speaker.id).get(talk.id);

      expect(result).toEqual({
        id: talk.id,
        title: talk.title,
        abstract: talk.abstract,
        level: talk.level,
        languages: talk.languages,
        references: talk.references,
        archived: talk.archived,
        createdAt: talk.createdAt.toUTCString(),
        invitationLink: `${config.appUrl}/invite/talk/${talk.invitationCode}`,
        isOwner: true,
        speakers: [
          {
            id: speaker.id,
            name: speaker.name,
            picture: speaker.picture,
            company: speaker.company,
            isOwner: true,
            isCurrentUser: true,
          },
        ],
        submissions: [],
      });
    });

    it('returns cospeaker talk', async () => {
      const owner = await userFactory();
      await talkFactory({ speakers: [owner] });
      const talk = await talkFactory({ speakers: [owner, speaker] });

      const result = await TalksLibrary.for(speaker.id).get(talk.id);

      expect(result.id).toBe(talk.id);
      expect(result.isOwner).toBe(false);
      expect(result.speakers).toEqual([
        {
          id: owner.id,
          name: owner.name,
          picture: owner.picture,
          company: owner.company,
          isOwner: true,
          isCurrentUser: false,
        },
        {
          id: speaker.id,
          name: speaker.name,
          picture: speaker.picture,
          company: speaker.company,
          isOwner: false,
          isCurrentUser: true,
        },
      ]);
    });

    it('returns proposals when talk submitted', async () => {
      const speaker = await userFactory();
      const event = await eventFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ talk, event });

      const result = await TalksLibrary.for(speaker.id).get(talk.id);

      expect(result.submissions).toEqual([
        {
          name: proposal.event.name,
          slug: proposal.event.slug,
          logo: proposal.event.logo,
          proposalStatus: SpeakerProposalStatus.DeliberationPending,
        },
      ]);
    });

    it('throws an error when talk not found', async () => {
      const speaker = await userFactory();
      await expect(TalksLibrary.for(speaker.id).get('XXX')).rejects.toThrowError(TalkNotFoundError);
    });
  });

  describe('list', () => {
    it('returns speaker talks list', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      await talkFactory({ speakers: [speaker], attributes: { archived: true } });

      const otherSpeaker = await userFactory();
      await talkFactory({ speakers: [otherSpeaker] });

      const result = await TalksLibrary.for(speaker.id).list();

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

      const result = await TalksLibrary.for(cospeaker.id).list();

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

      const result = await TalksLibrary.for(speaker.id).list({ archived: true });

      expect(result.length).toBe(1);
      expect(result[0].id).toBe(talk.id);
    });
  });

  describe('add', () => {
    it('adds a talk in the library', async () => {
      const result = await TalksLibrary.for(speaker.id).add({
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

  describe('update', () => {
    it('updates a talk into the speaker talks library', async () => {
      const { id: talkId } = await talkFactory({
        speakers: [speaker],
        attributes: {
          title: 'Talk title',
          abstract: 'Talk abstract',
          references: 'Talk references',
          languages: ['fr'],
          level: 'ADVANCED',
        },
      });

      await TalksLibrary.for(speaker.id).update(talkId, {
        title: 'Talk title updated',
        abstract: 'Talk abstract updated',
        references: 'Talk references updated',
        languages: ['fr', 'en'],
        level: 'BEGINNER',
      });

      const talk = await db.talk.findUnique({
        where: { id: talkId },
        include: { speakers: true },
      });

      expect(talk?.title).toBe('Talk title updated');
      expect(talk?.abstract).toBe('Talk abstract updated');
      expect(talk?.references).toBe('Talk references updated');
      expect(talk?.languages).toEqual(['fr', 'en']);
      expect(talk?.level).toEqual('BEGINNER');
    });

    it('throws an error when talk does not belong to the speaker', async () => {
      const otherSpeaker = await userFactory();
      const talk = await talkFactory({ speakers: [otherSpeaker] });

      await expect(
        TalksLibrary.for(speaker.id).update(talk.id, {
          title: 'Talk title',
          abstract: 'Talk abstract',
          references: 'Talk references',
          languages: ['fr'],
          level: 'ADVANCED',
        }),
      ).rejects.toThrowError(TalkNotFoundError);
    });

    it('throws an error when talk not found', async () => {
      await expect(
        TalksLibrary.for(speaker.id).update('XXX', {
          title: 'Talk title',
          abstract: 'Talk abstract',
          references: 'Talk references',
          languages: ['fr'],
          level: 'ADVANCED',
        }),
      ).rejects.toThrowError(TalkNotFoundError);
    });
  });

  describe('archive', () => {
    it('archives a talk', async () => {
      const talk = await talkFactory({ speakers: [speaker] });

      await TalksLibrary.for(speaker.id).archive(talk.id);

      const talkUpdated = await db.talk.findUnique({ where: { id: talk.id } });
      expect(talkUpdated?.archived).toBe(true);
    });

    it('throws an error when talk doesnt belong to the speaker', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const updater = await userFactory();

      await expect(TalksLibrary.for(updater.id).archive(talk.id)).rejects.toThrowError(TalkNotFoundError);
    });

    it('throws an error when talk not found', async () => {
      await expect(TalksLibrary.for(speaker.id).archive('XXX')).rejects.toThrowError(TalkNotFoundError);
    });
  });

  describe('restore', () => {
    it('restores a archived talk', async () => {
      const talk = await talkFactory({
        speakers: [speaker],
        attributes: { archived: true },
      });

      await TalksLibrary.for(speaker.id).restore(talk.id);

      const talkUpdated = await db.talk.findUnique({ where: { id: talk.id } });
      expect(talkUpdated?.archived).toBe(false);
    });

    it('throws an error when talk doesnt belong to the speaker', async () => {
      const talk = await talkFactory({
        speakers: [speaker],
        attributes: { archived: true },
      });
      const updater = await userFactory();

      await expect(TalksLibrary.for(updater.id).restore(talk.id)).rejects.toThrowError(TalkNotFoundError);
    });

    it('throws an error when talk not found', async () => {
      await expect(TalksLibrary.for(speaker.id).restore('XXX')).rejects.toThrowError(TalkNotFoundError);
    });
  });

  describe('removeCoSpeaker', () => {
    it('removes a cospeaker from the talk', async () => {
      const cospeaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker, cospeaker] });

      await TalksLibrary.for(speaker.id).removeCoSpeaker(talk.id, cospeaker.id);

      const talkUpdated = await db.talk.findUnique({
        where: { id: talk.id },
        include: { speakers: true },
      });

      const speakers = talkUpdated?.speakers.map(({ id }) => id);
      expect(speakers?.length).toBe(1);
      expect(speakers).toContain(speaker.id);
    });

    it('throws an error when talk doesnt belong to the speaker', async () => {
      const cospeaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker, cospeaker] });

      const updater = await userFactory();
      await expect(TalksLibrary.for(updater.id).removeCoSpeaker(talk.id, cospeaker.id)).rejects.toThrowError(
        TalkNotFoundError,
      );
    });

    it('throws an error when talk not found', async () => {
      const cospeaker = await userFactory();
      await expect(TalksLibrary.for(speaker.id).removeCoSpeaker('XXX', cospeaker.id)).rejects.toThrowError(
        TalkNotFoundError,
      );
    });
  });

  describe('Validate TalkSaveSchema', () => {
    it('validates talk form data', async () => {
      const result = TalksLibrary.TalkSchema.safeParse({
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
      const result = TalksLibrary.TalkSchema.safeParse({
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
});
