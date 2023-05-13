import { disconnectDB, resetDB } from 'tests/db-helpers';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';

import { db } from '../../../libs/db';
import { TalkNotFoundError } from '../../../libs/errors';
import { archiveTalk, restoreTalk } from './archive-talk.server';

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
