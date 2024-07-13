import type { User } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

import { appUrl } from '~/libs/env/env.server.ts';
import { TalkNotFoundError } from '~/libs/errors.server.ts';
import { SpeakerProposalStatus } from '~/types/speaker.types.ts';

import { SpeakerTalk } from './speaker-talk.ts';

describe('SpeakerTalk', () => {
  let speaker: User;
  beforeEach(async () => {
    speaker = await userFactory();
  });

  describe('#get', () => {
    it('returns speaker talk', async () => {
      const talk = await talkFactory({ speakers: [speaker] });

      const result = await SpeakerTalk.for(speaker.id, talk.id).get();

      expect(result).toEqual({
        id: talk.id,
        title: talk.title,
        abstract: talk.abstract,
        level: talk.level,
        languages: talk.languages,
        references: talk.references,
        archived: talk.archived,
        createdAt: talk.createdAt.toISOString(),
        invitationLink: `${appUrl()}/invite/talk/${talk.invitationCode}`,
        isOwner: true,
        speakers: [
          {
            id: speaker.id,
            name: speaker.name,
            bio: speaker.bio,
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

      const result = await SpeakerTalk.for(speaker.id, talk.id).get();

      expect(result.id).toBe(talk.id);
      expect(result.isOwner).toBe(false);
      expect(result.speakers).toEqual([
        {
          id: owner.id,
          name: owner.name,
          bio: owner.bio,
          picture: owner.picture,
          company: owner.company,
          isOwner: true,
          isCurrentUser: false,
        },
        {
          id: speaker.id,
          name: speaker.name,
          bio: speaker.bio,
          picture: speaker.picture,
          company: speaker.company,
          isOwner: false,
          isCurrentUser: true,
        },
      ]);
    });

    it('returns proposals when talk submitted ordered by creation date', async () => {
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal1 = await proposalFactory({ talk, event: await eventFactory() });
      const proposal2 = await proposalFactory({ talk, event: await eventFactory() });

      const result = await SpeakerTalk.for(speaker.id, talk.id).get();

      expect(result.submissions).toEqual([
        {
          name: proposal2.event.name,
          slug: proposal2.event.slug,
          logo: proposal2.event.logo,
          proposalStatus: SpeakerProposalStatus.DeliberationPending,
          createdAt: proposal2.createdAt.toISOString(),
        },
        {
          name: proposal1.event.name,
          slug: proposal1.event.slug,
          logo: proposal1.event.logo,
          proposalStatus: SpeakerProposalStatus.DeliberationPending,
          createdAt: proposal1.createdAt.toISOString(),
        },
      ]);
    });

    it('throws an error when talk not found', async () => {
      const speaker = await userFactory();
      await expect(SpeakerTalk.for(speaker.id, 'XXX').get()).rejects.toThrowError(TalkNotFoundError);
    });
  });

  describe('#update', () => {
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

      const speakerTalk = new SpeakerTalk(speaker.id, talkId);
      const talk = await speakerTalk.update({
        title: 'Talk title updated',
        abstract: 'Talk abstract updated',
        references: 'Talk references updated',
        languages: ['fr', 'en'],
        level: 'BEGINNER',
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

      const speakerTalk = new SpeakerTalk(speaker.id, talk.id);
      await expect(
        speakerTalk.update({
          title: 'Talk title',
          abstract: 'Talk abstract',
          references: 'Talk references',
          languages: ['fr'],
          level: 'ADVANCED',
        }),
      ).rejects.toThrowError(TalkNotFoundError);
    });

    it('throws an error when talk not found', async () => {
      const speakerTalk = new SpeakerTalk(speaker.id, 'XXX');
      await expect(
        speakerTalk.update({
          title: 'Talk title',
          abstract: 'Talk abstract',
          references: 'Talk references',
          languages: ['fr'],
          level: 'ADVANCED',
        }),
      ).rejects.toThrowError(TalkNotFoundError);
    });
  });

  describe('#archive', () => {
    it('archives a talk', async () => {
      const talk = await talkFactory({ speakers: [speaker] });

      await SpeakerTalk.for(speaker.id, talk.id).archive();

      const talkUpdated = await db.talk.findUnique({ where: { id: talk.id } });
      expect(talkUpdated?.archived).toBe(true);
    });

    it('throws an error when talk doesnt belong to the speaker', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const updater = await userFactory();

      await expect(SpeakerTalk.for(updater.id, talk.id).archive()).rejects.toThrowError(TalkNotFoundError);
    });

    it('throws an error when talk not found', async () => {
      await expect(SpeakerTalk.for(speaker.id, 'XXX').archive()).rejects.toThrowError(TalkNotFoundError);
    });
  });

  describe('#restore', () => {
    it('restores a archived talk', async () => {
      const talk = await talkFactory({
        speakers: [speaker],
        attributes: { archived: true },
      });

      await SpeakerTalk.for(speaker.id, talk.id).restore();

      const talkUpdated = await db.talk.findUnique({ where: { id: talk.id } });
      expect(talkUpdated?.archived).toBe(false);
    });

    it('throws an error when talk doesnt belong to the speaker', async () => {
      const talk = await talkFactory({
        speakers: [speaker],
        attributes: { archived: true },
      });
      const updater = await userFactory();

      await expect(SpeakerTalk.for(updater.id, talk.id).restore()).rejects.toThrowError(TalkNotFoundError);
    });

    it('throws an error when talk not found', async () => {
      await expect(SpeakerTalk.for(speaker.id, 'XXX').restore()).rejects.toThrowError(TalkNotFoundError);
    });
  });

  describe('#removeCoSpeaker', () => {
    it('removes a cospeaker from the talk', async () => {
      const cospeaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker, cospeaker] });

      await SpeakerTalk.for(speaker.id, talk.id).removeCoSpeaker(cospeaker.id);

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
      await expect(SpeakerTalk.for(updater.id, talk.id).removeCoSpeaker(cospeaker.id)).rejects.toThrowError(
        TalkNotFoundError,
      );
    });

    it('throws an error when talk not found', async () => {
      const cospeaker = await userFactory();
      await expect(SpeakerTalk.for(speaker.id, 'XXX').removeCoSpeaker(cospeaker.id)).rejects.toThrowError(
        TalkNotFoundError,
      );
    });
  });

  describe('#isSubmittedTo', () => {
    it('checks if a talk has been submitted to an event', async () => {
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });

      const event1 = await eventFactory();
      const event2 = await eventFactory();

      await proposalFactory({ talk, event: event1 });

      const speakerTalk = SpeakerTalk.for(speaker.id, talk.id);

      const isSubmittedToEvent1 = await speakerTalk.isSubmittedTo(event1.slug);
      expect(isSubmittedToEvent1).toBe(true);

      const isSubmittedToEvent2 = await speakerTalk.isSubmittedTo(event2.slug);
      expect(isSubmittedToEvent2).toBe(false);
    });
  });
});
