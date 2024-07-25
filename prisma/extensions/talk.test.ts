import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

describe('Talk', () => {
  describe('Talk#invitationLink', () => {
    it('returns the invitation link', async () => {
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });

      expect(talk.invitationLink).toBe(`http://127.0.0.1:3000/invite/talk/${talk.invitationCode}`);
    });
  });
});
