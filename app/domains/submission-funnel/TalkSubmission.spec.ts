import { TalkLevel } from '@prisma/client';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.ts';
import { CfpNotOpenError, EventNotFoundError, ProposalNotFoundError, TalkNotFoundError } from '~/libs/errors.ts';

import { TalkSubmission } from './TalkSubmission';
import { getTracksSchema } from './TalkSubmission.types';

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

  describe('#saveTracks', () => {
    it('set tracks of the proposal', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const format = await eventFormatFactory({ event });
      const category = await eventCategoryFactory({ event });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      await TalkSubmission.for(speaker.id, event.slug).saveTracks(talk.id, {
        formats: [format.id],
        categories: [category.id],
      });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { formats: true, categories: true },
      });

      expect(updatedProposal?.formats.length).toBe(1);
      expect(updatedProposal?.formats[0].id).toBe(format.id);
      expect(updatedProposal?.categories.length).toBe(1);
      expect(updatedProposal?.categories[0].id).toBe(category.id);
    });

    it('removes tracks of the proposal', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const format = await eventFormatFactory({ event });
      const category = await eventCategoryFactory({ event });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({
        event,
        talk,
        attributes: {
          formats: { connect: [{ id: format.id }] },
          categories: { connect: [{ id: category.id }] },
        },
      });

      await TalkSubmission.for(speaker.id, event.slug).saveTracks(talk.id, {
        formats: [],
        categories: [],
      });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { formats: true, categories: true },
      });

      expect(updatedProposal?.formats.length).toBe(0);
      expect(updatedProposal?.categories.length).toBe(0);
    });

    it('throws an error when proposal not found', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const speaker = await userFactory();
      const submission = TalkSubmission.for(speaker.id, event.slug);
      await expect(submission.saveTracks('XXX', { formats: [], categories: [] })).rejects.toThrowError(
        ProposalNotFoundError,
      );
    });
  });
});

describe('#getTracksSchema', () => {
  it('validates tracks form inputs', async () => {
    const TrackSchema = getTracksSchema(true, true);
    const result = TrackSchema.safeParse({
      formats: ['format 1', 'format 2'],
      categories: ['category 1', 'category 2'],
    });
    expect(result.success && result.data).toEqual({
      formats: ['format 1', 'format 2'],
      categories: ['category 1', 'category 2'],
    });
  });

  it.todo('returns errors when tracks are mandatory');
});
