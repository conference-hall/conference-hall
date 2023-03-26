import { resetDB, disconnectDB } from '../../../../tests/db-helpers';
import { inviteFactory } from '../../../../tests/factories/invite';
import { talkFactory } from '../../../../tests/factories/talks';
import { userFactory } from '../../../../tests/factories/users';
import { db } from '../../../libs/db';
import { InvitationNotFoundError } from '../../../libs/errors';
import { addCoSpeakerToTalk } from './add-co-speaker-to-talk.server';

describe('#addCoSpeakerToTalk', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('adds a cospeaker to the talk', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const invite = await inviteFactory({ talk });
    const cospeaker = await userFactory();

    const { id } = await addCoSpeakerToTalk(invite?.id!, cospeaker.id);

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
    await expect(addCoSpeakerToTalk('XXX', speaker.id)).rejects.toThrowError(InvitationNotFoundError);
  });
});
