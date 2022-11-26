import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
import { inviteFactory } from 'tests/factories/invite';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { ProposalNotFoundError } from '../../libs/errors';
import { getSubmittedProposal } from './get-submitted-proposal.server';

describe('#getSubmittedProposal', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns info about the proposal submitted on event', async () => {
    const event = await eventFactory();
    const format = await eventFormatFactory({ event });
    const category = await eventCategoryFactory({ event });
    const speaker = await userFactory();
    const speaker2 = await userFactory();
    const talk = await talkFactory({ speakers: [speaker, speaker2] });
    const proposal = await proposalFactory({ event, talk, formats: [format], categories: [category] });
    const invite = await inviteFactory({ proposal });

    const result = await getSubmittedProposal(talk.id, event.slug, speaker.id);

    expect(result).toEqual({
      id: proposal.id,
      title: proposal.title,
      invitationLink: `http://localhost:3001/invitation/${invite?.id}`,
      isOwner: true,
      speakers: [
        { id: speaker.id, isOwner: true, name: speaker.name, photoURL: speaker.photoURL },
        { id: speaker2.id, name: speaker2.name, photoURL: speaker2.photoURL, isOwner: false },
      ],
      formats: [{ id: format.id, name: format.name }],
      categories: [{ id: category.id, name: category.name }],
    });
  });

  it('throws an error if talk does not have proposal for the event', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });

    await expect(getSubmittedProposal(talk.id, event.slug, speaker.id)).rejects.toThrowError(ProposalNotFoundError);
  });

  it('throws an error if proposal does not belong to user', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk });

    const user = await userFactory();
    await expect(getSubmittedProposal(talk.id, event.slug, user.id)).rejects.toThrowError(ProposalNotFoundError);
  });
});
