import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

describe('Talk', () => {
  describe('Talk#invitationLink', () => {
    it('returns the invitation link', async () => {
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });

      expect(talk.invitationLink).toBe(`http://localhost:3001/invite/talk/${talk.invitationCode}`);
    });
  });
});