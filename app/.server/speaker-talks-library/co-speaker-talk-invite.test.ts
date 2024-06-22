import { db } from 'prisma/db.server.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

import { InvitationNotFoundError } from '~/libs/errors.server.ts';

import { CoSpeakerTalkInvite } from './co-speaker-talk-invite.ts';

describe('CoSpeakerTalkInvite', () => {
  describe('#check', () => {
    it('returns the talk for an invitation code', async () => {
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });

      const result = await CoSpeakerTalkInvite.with(talk.invitationCode).check();

      expect(result.id).toEqual(talk.id);
    });

    it('returns throws an error when invitation code not found', async () => {
      await expect(CoSpeakerTalkInvite.with('XXX').check()).rejects.toThrowError(InvitationNotFoundError);
    });
  });

  describe('#addCoSpeaker', () => {
    it('adds the user to the talk when invitation code valid', async () => {
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const cospeaker = await userFactory();

      const result = await CoSpeakerTalkInvite.with(talk.invitationCode).addCoSpeaker(cospeaker.id);

      const updated = await db.talk.findUnique({ where: { id: talk.id }, include: { speakers: true } });

      expect(result?.id).toBe(talk.id);

      const speakers = updated?.speakers.map(({ id }) => id);
      expect(speakers?.length).toBe(2);
      expect(speakers).toContain(speaker.id);
      expect(speakers).toContain(cospeaker.id);
    });

    it('returns throws an error when invitation code not found', async () => {
      const speaker = await userFactory();
      await expect(CoSpeakerTalkInvite.with('XXX').addCoSpeaker(speaker.id)).rejects.toThrowError(
        InvitationNotFoundError,
      );
    });
  });
});
