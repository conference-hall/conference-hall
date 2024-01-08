import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';

describe('Talk', () => {
  describe('Talk#invitationLink', () => {
    it('returns the invitation link', async () => {
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });

      expect(talk.invitationLink).toBe(`http://localhost:3001/invite/talk/${talk.invitationCode}`);
    });
  });
});
