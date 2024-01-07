import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';

describe('Proposal', () => {
  describe('Proposal#invitationLink', () => {
    it('returns the invitation link', async () => {
      const speaker = await userFactory();
      const event = await eventFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      expect(proposal.invitationLink).toBe(`http://localhost:3001/invite/proposal/${proposal.invitationCode}`);
    });
  });
});
