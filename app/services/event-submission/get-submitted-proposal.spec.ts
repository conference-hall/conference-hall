import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventCategoryFactory } from 'tests/factories/categories';
import { eventFactory } from 'tests/factories/events';
import { eventFormatFactory } from 'tests/factories/formats';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { ProposalNotFoundError } from '../errors';
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
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk, formats: [format], categories: [category] });

    const result = await getSubmittedProposal(talk.id, event.id, speaker.id);

    expect(result).toEqual({
      title: proposal.title,
      speakers: [{ name: speaker.name, photoURL: speaker.photoURL }],
      formats: [{ id: format.id, name: format.name }],
      categories: [{ id: category.id, name: category.name }],
    });
  });

  it('throws an error if talk does not have proposal for the event', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });

    await expect(getSubmittedProposal(talk.id, event.id, speaker.id)).rejects.toThrowError(ProposalNotFoundError);
  });

  it('throws an error if proposal does not belong to user', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk });

    const user = await userFactory();
    await expect(getSubmittedProposal(talk.id, event.id, user.id)).rejects.toThrowError(ProposalNotFoundError);
  });
});
