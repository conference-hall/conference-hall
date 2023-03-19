import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { CfpNotOpenError, EventNotFoundError } from '../../libs/errors';
import { getProposalCountsForEvent, listTalksToSubmit } from './list-talks-to-submit.server';

describe('#listTalksToSubmit', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns talks that can be submitted', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();
    const otherSpeaker = await userFactory();

    // other speaker talk (not returned)
    await talkFactory({ speakers: [otherSpeaker] });
    // archived talk (not returned)
    await talkFactory({ speakers: [speaker], traits: ['archived'] });
    // talk submitted (not returned)
    const talk1 = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk: talk1 });
    // not submitted talk (expected)
    const talk2 = await talkFactory({ speakers: [speaker] });
    // talk submitted as draft (expected)
    const talk3 = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk: talk3, traits: ['draft'] });

    const result = await listTalksToSubmit(speaker.id, event.slug);

    expect(result).toEqual([
      {
        id: talk3.id,
        title: talk3.title,
        isDraft: true,
        speakers: [{ id: speaker.id, name: speaker.name, photoURL: speaker.photoURL }],
      },
      {
        id: talk2.id,
        title: talk2.title,
        isDraft: false,
        speakers: [{ id: speaker.id, name: speaker.name, photoURL: speaker.photoURL }],
      },
    ]);
  });

  it('throws an error when CFP not opened', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-past'] });
    const speaker = await userFactory();
    await expect(listTalksToSubmit(speaker.id, event.slug)).rejects.toThrowError(CfpNotOpenError);
  });

  it('throws an error when event not found', async () => {
    const speaker = await userFactory();
    await expect(listTalksToSubmit(speaker.id, 'XXX')).rejects.toThrowError(EventNotFoundError);
  });
});

describe('#getProposalCountsForEvent', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('counts speaker proposals for an event', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'], attributes: { maxProposals: 3 } });
    const speaker = await userFactory();
    const otherSpeaker = await userFactory();

    // other speaker proposal (not counted)
    const talk1 = await talkFactory({ speakers: [otherSpeaker] });
    await proposalFactory({ event, talk: talk1 });
    // draft proposal (not counted)
    const talk2 = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk: talk2, traits: ['draft'] });
    // proposal (counted)
    const talk3 = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk: talk3 });

    const result = await getProposalCountsForEvent(speaker.id, event.slug);

    expect(result).toEqual({ max: 3, submitted: 1 });
  });

  it('throws an error when event not found', async () => {
    const speaker = await userFactory();
    await expect(getProposalCountsForEvent(speaker.id, 'XXX')).rejects.toThrowError(EventNotFoundError);
  });
});
