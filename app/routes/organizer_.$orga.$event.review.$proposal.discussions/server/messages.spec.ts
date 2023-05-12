import type { Event, Team, User } from '@prisma/client';
import { MessageChannel } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { messageFactory } from 'tests/factories/messages';
import { teamFactory } from 'tests/factories/team';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { addProposalMessage, getProposalMessages, removeProposalMessage } from './messages.server';
import { db } from '~/libs/db';
import { ForbiddenOperationError } from '~/libs/errors';

describe('#getProposalMessages', () => {
  let owner: User, member: User, speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory();
    team = await teamFactory({ owners: [owner], members: [member] });
    event = await eventFactory({ team });
  });
  afterEach(disconnectDB);

  it('retrieve proposals messages', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const message1 = await messageFactory({ proposal, user: owner, attributes: { message: 'Message 1' } });
    const message2 = await messageFactory({ proposal, user: member, attributes: { message: 'Message 2' } });

    const messages = await getProposalMessages(event.slug, proposal.id, owner.id);

    expect(messages).toEqual([
      {
        id: message2.id,
        userId: member.id,
        name: member.name,
        picture: member.picture,
        message: 'Message 2',
      },
      {
        id: message1.id,
        userId: owner.id,
        name: owner.name,
        picture: owner.picture,
        message: 'Message 1',
      },
    ]);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await expect(getProposalMessages(event.slug, proposal.id, user.id)).rejects.toThrowError(ForbiddenOperationError);
  });
});

describe('#addProposalMessage', () => {
  let owner: User, speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    speaker = await userFactory();
    team = await teamFactory({ owners: [owner] });
    event = await eventFactory({ team });
  });
  afterEach(disconnectDB);

  it('adds message to a proposal', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    await addProposalMessage(event.slug, proposal.id, owner.id, 'My message');

    const messages = await db.message.findMany({ where: { userId: owner.id, proposalId: proposal.id } });
    expect(messages.length).toBe(1);

    const message = messages[0];
    expect(message.message).toBe('My message');
    expect(message.channel).toBe(MessageChannel.ORGANIZER);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await expect(addProposalMessage(event.slug, proposal.id, user.id, 'My message')).rejects.toThrowError(
      ForbiddenOperationError
    );
  });
});

describe('#removeProposalMessage', () => {
  let owner: User, member: User, speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    member = await userFactory();
    speaker = await userFactory();
    team = await teamFactory({ owners: [owner], members: [member] });
    event = await eventFactory({ team });
  });
  afterEach(disconnectDB);

  it('removes a message from a proposal', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const message = await messageFactory({ user: owner, proposal });

    await removeProposalMessage(event.slug, proposal.id, owner.id, message.id);

    const messages = await db.message.findMany({ where: { userId: owner.id, proposalId: proposal.id } });
    expect(messages.length).toBe(0);
  });

  it('removes a message from a proposal only if it belongs to the user', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const message = await messageFactory({ user: member, proposal });

    await removeProposalMessage(event.slug, proposal.id, owner.id, message.id);

    const messages = await db.message.findMany({ where: { userId: member.id, proposalId: proposal.id } });
    expect(messages.length).toBe(1);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const message = await messageFactory({ user, proposal });
    await expect(removeProposalMessage(event.slug, proposal.id, user.id, message.id)).rejects.toThrowError(
      ForbiddenOperationError
    );
  });
});
