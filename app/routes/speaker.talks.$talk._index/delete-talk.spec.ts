import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { db } from '../../libs/db';
import { TalkNotFoundError } from '../../libs/errors';
import { deleteTalk } from './delete-talk.server';

describe('#deleteTalk', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('deletes a speaker talk', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });

    await deleteTalk(speaker.id, talk.id);

    const count = await db.talk.count({ where: { id: talk.id } });
    expect(count).toBe(0);
  });

  it('deletes a speaker talk and talk proposals still in draft', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const event1 = await eventFactory();
    await proposalFactory({ event: event1, talk, traits: ['draft'] });
    const event2 = await eventFactory();
    await proposalFactory({ event: event2, talk, traits: ['submitted'] });

    await deleteTalk(speaker.id, talk.id);

    const countTalk = await db.talk.count();
    const countProposal = await db.proposal.count();
    expect(countTalk).toBe(0);
    expect(countProposal).toBe(1);
  });

  it('throws an error when talk does not belong to the speaker', async () => {
    const speaker = await userFactory();
    const otherSpeaker = await userFactory();
    const talk = await talkFactory({ speakers: [otherSpeaker] });

    await expect(deleteTalk(speaker.id, talk.id)).rejects.toThrowError(TalkNotFoundError);
  });

  it('throws an error when talk not found', async () => {
    const speaker = await userFactory();
    await expect(deleteTalk(speaker.id, 'XXX')).rejects.toThrowError(TalkNotFoundError);
  });
});
