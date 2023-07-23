import { parse } from '@conform-to/zod';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';

import { db } from '~/libs/db';
import { ProposalNotFoundError } from '~/libs/errors';

import { getTracksSchema, saveTracks } from './save-tracks.server';

describe('#saveTracks', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('set tracks of the proposal', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const format = await eventFormatFactory({ event });
    const category = await eventCategoryFactory({ event });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });

    await saveTracks(talk.id, event.id, speaker.id, {
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

    await saveTracks(talk.id, event.id, speaker.id, {
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
    await expect(saveTracks('XXX', event.id, speaker.id, { formats: [], categories: [] })).rejects.toThrowError(
      ProposalNotFoundError,
    );
  });
});

describe('#getTracksSchema', () => {
  it('validates tracks form inputs', async () => {
    const form = new FormData();
    form.append('formats', 'format 1');
    form.append('formats', 'format 2');
    form.append('categories', 'category 1');
    form.append('categories', 'category 2');

    const TrackSchema = getTracksSchema(true, true);

    const result = parse(form, { schema: TrackSchema });
    expect(result.value).toEqual({
      formats: ['format 1', 'format 2'],
      categories: ['category 1', 'category 2'],
    });
  });

  it.todo('returns errors when tracks are mandatory');
});
