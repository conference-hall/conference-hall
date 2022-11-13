import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { db } from '~/services/db';
import { deleteSpeakerProposal } from './delete-speaker-proposal.server';

describe('#deleteProposal', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('deletes a proposal', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });

    await deleteSpeakerProposal({ proposalId: proposal.id, speakerId: speaker.id });

    const deleted = await db.proposal.findUnique({ where: { id: proposal.id } });

    expect(deleted).toBe(null);
  });

  it.todo('does not delete a proposal if cfp is closed?');

  it('does not delete a proposal if not belonging to user', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const otherSpeaker = await userFactory();
    const talk = await talkFactory({ speakers: [otherSpeaker] });
    const proposal = await proposalFactory({ event, talk });

    await deleteSpeakerProposal({ proposalId: proposal.id, speakerId: speaker.id });

    const deleted = await db.proposal.findUnique({ where: { id: proposal.id } });

    expect(deleted).not.toBe(1);
  });
});