import { resetDB, disconnectDB } from '../../../tests/db-helpers';
import { eventFactory } from '../../../tests/factories/events';
import { inviteFactory } from '../../../tests/factories/invite';
import { proposalFactory } from '../../../tests/factories/proposals';
import { talkFactory } from '../../../tests/factories/talks';
import { userFactory } from '../../../tests/factories/users';
import { db } from '../db';
import { InvitationNotFoundError, TalkNotFoundError } from '../errors';
import { archiveTalk, deleteTalk, inviteCoSpeakerToTalk, removeCoSpeakerFromTalk, restoreTalk } from './talks.server';

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

describe('#inviteCoSpeakerToTalk', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('adds a cospeaker to the talk', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const invite = await inviteFactory({ talk });
    const cospeaker = await userFactory();

    const { id } = await inviteCoSpeakerToTalk(invite?.id!, cospeaker.id);

    const result = await db.talk.findUnique({
      where: { id },
      include: { speakers: true },
    });

    const speakers = result?.speakers.map(({ id }) => id);
    expect(speakers?.length).toBe(2);
    expect(speakers).toContain(speaker.id);
    expect(speakers).toContain(cospeaker.id);
  });

  it('throws an error when invitation not found', async () => {
    const speaker = await userFactory();
    await expect(inviteCoSpeakerToTalk('XXX', speaker.id)).rejects.toThrowError(InvitationNotFoundError);
  });
});

describe('#removeCoSpeakerFromTalk', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('removes a cospeaker from the talk', async () => {
    const speaker = await userFactory();
    const cospeaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker, cospeaker] });

    await removeCoSpeakerFromTalk(speaker.id, talk.id, cospeaker.id);

    const talkUpdated = await db.talk.findUnique({
      where: { id: talk.id },
      include: { speakers: true },
    });

    const speakers = talkUpdated?.speakers.map(({ id }) => id);
    expect(speakers?.length).toBe(1);
    expect(speakers).toContain(speaker.id);
  });

  it('throws an error when talk doesnt belong to the speaker', async () => {
    const speaker = await userFactory();
    const cospeaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker, cospeaker] });

    const updater = await userFactory();
    await expect(removeCoSpeakerFromTalk(updater.id, talk.id, cospeaker.id)).rejects.toThrowError(TalkNotFoundError);
  });

  it('throws an error when talk not found', async () => {
    const speaker = await userFactory();
    const cospeaker = await userFactory();
    await expect(removeCoSpeakerFromTalk(speaker.id, 'XXX', cospeaker.id)).rejects.toThrowError(TalkNotFoundError);
  });
});

describe('#archiveTalk', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('archives a talk', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });

    await archiveTalk(speaker.id, talk.id);

    const talkUpdated = await db.talk.findUnique({ where: { id: talk.id } });
    expect(talkUpdated?.archived).toBe(true);
  });

  it('throws an error when talk doesnt belong to the speaker', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const updater = await userFactory();

    await expect(archiveTalk(updater.id, talk.id)).rejects.toThrowError(TalkNotFoundError);
  });

  it('throws an error when talk not found', async () => {
    const speaker = await userFactory();
    await expect(archiveTalk(speaker.id, 'XXX')).rejects.toThrowError(TalkNotFoundError);
  });
});

describe('#restoreTalk', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('restores a archived talk', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({
      speakers: [speaker],
      attributes: { archived: true },
    });

    await restoreTalk(speaker.id, talk.id);

    const talkUpdated = await db.talk.findUnique({ where: { id: talk.id } });
    expect(talkUpdated?.archived).toBe(false);
  });

  it('throws an error when talk doesnt belong to the speaker', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({
      speakers: [speaker],
      attributes: { archived: true },
    });
    const updater = await userFactory();

    await expect(restoreTalk(updater.id, talk.id)).rejects.toThrowError(TalkNotFoundError);
  });

  it('throws an error when talk not found', async () => {
    const speaker = await userFactory();
    await expect(restoreTalk(speaker.id, 'XXX')).rejects.toThrowError(TalkNotFoundError);
  });
});
