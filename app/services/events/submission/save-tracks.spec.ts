import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { db } from '~/services/db';
import { saveSubmissionTracks } from './save-tracks.server';

describe('#saveSubmissionTracks', () => {
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

    await saveSubmissionTracks({
      talkId: talk.id,
      eventSlug: event.slug,
      speakerId: speaker.id,
      data: {
        formats: [format.id],
        categories: [category.id],
      },
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

    await saveSubmissionTracks({
      talkId: talk.id,
      eventSlug: event.slug,
      speakerId: speaker.id,
      data: {
        formats: [],
        categories: [],
      },
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
    const result = await saveSubmissionTracks({
      talkId: 'XXX',
      eventSlug: event.slug,
      speakerId: speaker.id,
      data: {
        formats: [],
        categories: [],
      },
    });
    expect(result.errors[0].message).toBe('Proposal not found');
  });
});
