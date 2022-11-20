import { resetDB, disconnectDB } from '../../../tests/db-helpers';
import { inviteFactory } from '../../../tests/factories/invite';
import { talkFactory } from '../../../tests/factories/talks';
import { userFactory } from '../../../tests/factories/users';
import { db } from '../db';
import { InvitationNotFoundError, TalkNotFoundError } from '../errors';
import { inviteCoSpeakerToTalk, removeCoSpeakerFromTalk } from './co-speaker.server';

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
