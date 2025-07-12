import { getSharedServerEnv } from 'servers/environment.server.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

const env = getSharedServerEnv();

describe('Talk', () => {
  describe('Talk#invitationLink', () => {
    it('returns the invitation link', async () => {
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });

      expect(talk.invitationLink).toBe(`${env.APP_URL}/invite/talk/${talk.invitationCode}`);
    });
  });
});
