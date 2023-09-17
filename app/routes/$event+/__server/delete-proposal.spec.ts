import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.ts';

import { deleteProposal } from './delete-proposal.server.ts';

describe('#deleteProposal', () => {
  it('deletes a proposal', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });

    await deleteProposal(proposal.id, speaker.id);

    const deleted = await db.proposal.findUnique({ where: { id: proposal.id } });

    expect(deleted).toBe(null);
  });

  it('does not delete a proposal if not belonging to user', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const otherSpeaker = await userFactory();
    const talk = await talkFactory({ speakers: [otherSpeaker] });
    const proposal = await proposalFactory({ event, talk });

    await deleteProposal(proposal.id, speaker.id);

    const deleted = await db.proposal.findUnique({ where: { id: proposal.id } });

    expect(deleted).not.toBe(1);
  });
});
