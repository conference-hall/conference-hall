import { resetDB, disconnectDB } from '../../../tests/db-helpers';
import { eventFactory } from '../../../tests/factories/events';
import { inviteFactory } from '../../../tests/factories/invite';
import { proposalFactory } from '../../../tests/factories/proposals';
import { talkFactory } from '../../../tests/factories/talks';
import { userFactory } from '../../../tests/factories/users';
import { ProposalNotFoundError } from '../errors';
import { getProposalSpeakers } from './speakers.server';

describe('#getProposalSpeakers', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns speakers of a proposal', async () => {
    const event = await eventFactory();
    const speaker1 = await userFactory();
    const speaker2 = await userFactory();
    const talk = await talkFactory({ speakers: [speaker1, speaker2] });
    const proposal = await proposalFactory({ event, talk });
    const invite = await inviteFactory({ proposal });

    const result = await getProposalSpeakers(talk.id, event.slug, speaker1.id);

    expect(result).toEqual({
      id: proposal.id,
      isOwner: true,
      invitationLink: `http://localhost:3001/invitation/${invite?.id}`,
      speakers: [
        { id: speaker1.id, name: speaker1.name, photoURL: speaker1.photoURL, isOwner: true },
        { id: speaker2.id, name: speaker2.name, photoURL: speaker2.photoURL, isOwner: false },
      ],
    });
  });

  it('throws an error when proposal does not belong to user', async () => {
    const event = await eventFactory();
    const speaker1 = await userFactory();
    const talk = await talkFactory({ speakers: [speaker1] });
    await proposalFactory({ event, talk });

    const speaker2 = await userFactory();
    await expect(getProposalSpeakers(talk.id, event.slug, speaker2.id)).rejects.toThrowError(ProposalNotFoundError);
  });
});
