import { disconnectDB, resetDB } from '../../../tests/db-helpers';
import { eventCategoryFactory } from '../../../tests/factories/categories';
import { eventFactory } from '../../../tests/factories/events';
import { eventFormatFactory } from '../../../tests/factories/formats';
import { proposalFactory } from '../../../tests/factories/proposals';
import { talkFactory } from '../../../tests/factories/talks';
import { userFactory } from '../../../tests/factories/users';
import { db } from '../db';
import { ProposalNotFoundError } from '../errors';
import { getProposalTracks, saveTracks, validateTracksForm } from './tracks.server';

describe('#getProposalTracks', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterAll(async () => {
    await disconnectDB();
  });

  it('returns the default response', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const format = await eventFormatFactory({ event });
    const category = await eventCategoryFactory({ event });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    await proposalFactory({
      event,
      talk,
      attributes: {
        formats: { connect: [{ id: format.id }] },
        categories: { connect: [{ id: category.id }] },
      },
    });

    const tracks = await getProposalTracks(talk.id, event.id, speaker.id);

    expect(tracks).toEqual({
      formats: [format.id],
      categories: [category.id],
    });
  });

  it('throws an error when proposal doesnt belongs to user', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk });

    const user = await userFactory();
    await expect(getProposalTracks(talk.id, event.id, user.id)).rejects.toThrowError(ProposalNotFoundError);
  });

  it('throws an error when proposal not found', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();
    await expect(getProposalTracks('XXX', event.id, speaker.id)).rejects.toThrowError(ProposalNotFoundError);
  });
});

describe('#saveTracks', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterAll(async () => {
    await disconnectDB();
  });

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
      ProposalNotFoundError
    );
  });
});

describe('#validateTracksForm', () => {
  it('validates tracks form inputs', async () => {
    const formData = new FormData();
    formData.append('formats', 'format 1');
    formData.append('formats', 'format 2');
    formData.append('categories', 'category 1');
    formData.append('categories', 'category 2');

    const result = validateTracksForm(formData);
    expect(result.success && result.data).toEqual({
      formats: ['format 1', 'format 2'],
      categories: ['category 1', 'category 2'],
    });
  });
});
