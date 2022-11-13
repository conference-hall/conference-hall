import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { getSubmissionTracks } from './get-tracks.server';

describe('#getSubmissionTracks', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

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

    const result = await getSubmissionTracks({ talkId: talk.id, eventSlug: event.slug, speakerId: speaker.id });

    expect(result.success && result.data).toEqual({ formats: [format.id], categories: [category.id] });
  });

  it('throws an error when proposal doesnt belongs to user', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk });

    const user = await userFactory();
    const result = await getSubmissionTracks({ talkId: talk.id, eventSlug: event.slug, speakerId: user.id });
    expect(result.errors[0].message).toBe('Proposal not found');
  });

  it('throws an error when proposal not found', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();
    const result = await getSubmissionTracks({ talkId: 'XXX', eventSlug: event.slug, speakerId: speaker.id });
    expect(result.errors[0].message).toBe('Proposal not found');
  });
});
