import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';

import { db } from '~/libs/db';
import { InvitationNotFoundError } from '~/libs/errors';

import { addCoSpeakerToTalk, checkTalkInviteCode } from './invite-talk.server';

describe('#addCoSpeakerToTalk', () => {
  it('adds a cospeaker to the talk', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const cospeaker = await userFactory();

    const result = await addCoSpeakerToTalk(talk.invitationCode, cospeaker.id);

    const updated = await db.talk.findUnique({ where: { id: talk.id }, include: { speakers: true } });

    expect(result?.id).toBe(talk.id);

    const speakers = updated?.speakers.map(({ id }) => id);
    expect(speakers?.length).toBe(2);
    expect(speakers).toContain(speaker.id);
    expect(speakers).toContain(cospeaker.id);
  });

  it('returns throws an error when invitation code not found', async () => {
    const speaker = await userFactory();
    await expect(addCoSpeakerToTalk('XXX', speaker.id)).rejects.toThrowError(InvitationNotFoundError);
  });
});

describe('#checkTalkInviteCode', () => {
  it('returns the talk for an invitation code', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });

    const result = await checkTalkInviteCode(talk.invitationCode);

    expect(result).toEqual({ id: talk?.id, title: talk?.title });
  });

  it('returns throws an error when invitation code not found', async () => {
    await expect(checkTalkInviteCode('XXX')).rejects.toThrowError(InvitationNotFoundError);
  });
});
