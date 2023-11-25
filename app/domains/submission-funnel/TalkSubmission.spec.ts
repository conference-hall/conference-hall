import { TalkLevel } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.ts';
import { CfpNotOpenError, EventNotFoundError, TalkNotFoundError } from '~/libs/errors.ts';

import { TalkSubmission } from './TalkSubmission';

describe('TalkSubmission', () => {
  describe('#saveDraft', () => {
    it('create a new draft proposal from scratch', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const speaker = await userFactory();

      const data = {
        title: 'New title',
        abstract: 'New abstract',
        references: 'New reference',
        languages: ['en'],
        level: TalkLevel.ADVANCED,
      };

      const { talkId } = await TalkSubmission.for(speaker.id, event.slug).saveDraft('new', data);

      const talk = await db.talk.findUnique({ where: { id: talkId }, include: { speakers: true } });
      expect(talk?.title).toEqual(data.title);
      expect(talk?.abstract).toEqual(data.abstract);
      expect(talk?.references).toEqual(data.references);
      expect(talk?.languages).toEqual(data.languages);
      expect(talk?.level).toEqual(data.level);
      expect(talk?.speakers[0].id).toEqual(speaker.id);

      const proposal = await db.proposal.findFirst({ where: { talkId }, include: { speakers: true } });
      expect(proposal?.title).toEqual(data.title);
      expect(proposal?.abstract).toEqual(data.abstract);
      expect(proposal?.references).toEqual(data.references);
      expect(proposal?.status).toEqual('DRAFT');
      expect(proposal?.eventId).toEqual(event.id);
      expect(proposal?.languages).toEqual(data.languages);
      expect(proposal?.level).toEqual(data.level);
      expect(proposal?.speakers[0].id).toEqual(speaker.id);
    });

    it('create a new draft proposal from a existing talk', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });

      const data = {
        title: 'New title',
        abstract: 'New abstract',
        references: 'New reference',
        languages: ['de'],
        level: TalkLevel.ADVANCED,
      };

      const { talkId } = await TalkSubmission.for(speaker.id, event.slug).saveDraft(talk.id, data);

      const updatedTalk = await db.talk.findUnique({ where: { id: talkId }, include: { speakers: true } });
      expect(updatedTalk?.title).toEqual(data.title);
      expect(updatedTalk?.abstract).toEqual(data.abstract);
      expect(updatedTalk?.references).toEqual(data.references);
      expect(updatedTalk?.languages).toEqual(data.languages);
      expect(updatedTalk?.level).toEqual(data.level);
      expect(updatedTalk?.speakers[0].id).toEqual(speaker.id);

      const proposal = await db.proposal.findFirst({ where: { talkId }, include: { speakers: true } });
      expect(proposal?.title).toEqual(data.title);
      expect(proposal?.abstract).toEqual(data.abstract);
      expect(proposal?.references).toEqual(data.references);
      expect(proposal?.status).toEqual('DRAFT');
      expect(proposal?.eventId).toEqual(event.id);
      expect(proposal?.languages).toEqual(data.languages);
      expect(proposal?.level).toEqual(data.level);
      expect(proposal?.speakers[0].id).toEqual(speaker.id);
    });

    it('throws an error when talk not found', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const speaker = await userFactory();
      const data = {
        title: 'New title',
        abstract: 'New abstract',
        references: 'New reference',
        languages: ['en'],
        level: TalkLevel.ADVANCED,
      };

      const submission = TalkSubmission.for(speaker.id, event.slug);
      await expect(submission.saveDraft('XXX', data)).rejects.toThrowError(TalkNotFoundError);
    });

    it('throws an error when talk not belong to the user', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });

      const data = {
        title: 'New title',
        abstract: 'New abstract',
        references: 'New reference',
        languages: ['en'],
        level: TalkLevel.ADVANCED,
      };

      const user = await userFactory();
      const submission = TalkSubmission.for(user.id, event.slug);
      await expect(submission.saveDraft(talk.id, data)).rejects.toThrowError(TalkNotFoundError);
    });

    it('throws an error when CFP is not open', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-past'] });
      const speaker = await userFactory();
      const data = {
        title: 'New title',
        abstract: 'New abstract',
        references: 'New reference',
        languages: ['en'],
        level: TalkLevel.ADVANCED,
      };

      const submission = TalkSubmission.for(speaker.id, event.slug);
      await expect(submission.saveDraft('new', data)).rejects.toThrowError(CfpNotOpenError);
    });

    it('throws an error when event not found', async () => {
      const speaker = await userFactory();
      const data = {
        title: 'New title',
        abstract: 'New abstract',
        references: 'New reference',
        languages: ['en'],
        level: TalkLevel.ADVANCED,
      };

      const submission = TalkSubmission.for(speaker.id, 'XXX');
      await expect(submission.saveDraft('new', data)).rejects.toThrowError(EventNotFoundError);
    });
  });
});
