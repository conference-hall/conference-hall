import type { Event, Organization, User } from '@prisma/client';
import { MessageChannel } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { messageFactory } from 'tests/factories/messages';
import { organizationFactory } from 'tests/factories/organization';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { db } from '../db';
import { ForbiddenOperationError } from '../errors';
import { addProposalComment, removeProposalComment } from './comments.server';

describe('#addProposalComment', () => {
  let owner: User, speaker: User;
  let organization: Organization;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    speaker = await userFactory();
    organization = await organizationFactory({ owners: [owner] });
    event = await eventFactory({ organization });
  });
  afterEach(disconnectDB);

  it('adds message to a proposal', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    await addProposalComment(organization.slug, event.slug, proposal.id, owner.id, 'My message');

    const messages = await db.message.findMany({ where: { userId: owner.id, proposalId: proposal.id } });
    expect(messages.length).toBe(1);

    const message = messages[0];
    expect(message.message).toBe('My message');
    expect(message.channel).toBe(MessageChannel.ORGANIZER);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    await expect(
      addProposalComment(organization.slug, event.slug, proposal.id, user.id, 'My message')
    ).rejects.toThrowError(ForbiddenOperationError);
  });
});

describe('#removeProposalComment', () => {
  let owner: User, member: User, speaker: User;
  let organization: Organization;
  let event: Event;

  beforeEach(async () => {
    await resetDB();
    owner = await userFactory();
    member = await userFactory();
    speaker = await userFactory();
    organization = await organizationFactory({ owners: [owner], members: [member] });
    event = await eventFactory({ organization });
  });
  afterEach(disconnectDB);

  it('removes a message from a proposal', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const message = await messageFactory({ user: owner, proposal });

    await removeProposalComment(organization.slug, event.slug, proposal.id, owner.id, message.id);

    const messages = await db.message.findMany({ where: { userId: owner.id, proposalId: proposal.id } });
    expect(messages.length).toBe(0);
  });

  it('removes a message from a proposal only if it belongs to the user', async () => {
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const message = await messageFactory({ user: member, proposal });

    await removeProposalComment(organization.slug, event.slug, proposal.id, owner.id, message.id);

    const messages = await db.message.findMany({ where: { userId: member.id, proposalId: proposal.id } });
    expect(messages.length).toBe(1);
  });

  it('throws an error if user does not belong to event orga', async () => {
    const user = await userFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });
    const message = await messageFactory({ user, proposal });
    await expect(
      removeProposalComment(organization.slug, event.slug, proposal.id, user.id, message.id)
    ).rejects.toThrowError(ForbiddenOperationError);
  });
});
