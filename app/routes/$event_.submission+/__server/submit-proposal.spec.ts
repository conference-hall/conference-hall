import { getEmails, resetEmails } from 'tests/email-helpers.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.ts';
import {
  CfpNotOpenError,
  EventNotFoundError,
  MaxSubmittedProposalsReachedError,
  ProposalNotFoundError,
} from '~/libs/errors.ts';

import { submitProposal } from './submit-proposal.server.ts';

describe('#submitProposal', () => {
  beforeEach(async () => {
    await resetEmails();
  });

  it('submit a proposal', async () => {
    const event = await eventFactory({
      traits: ['conference-cfp-open'],
      attributes: { name: 'Event 1', emailOrganizer: 'ben@email.com', emailNotifications: ['submitted'] },
    });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk: talk, traits: ['draft'] });
    const data = { message: 'User message' };

    await submitProposal(talk.id, event.slug, speaker.id, data);

    const result = await db.proposal.findUnique({ where: { id: proposal.id } });
    expect(result?.status).toEqual('SUBMITTED');
    expect(result?.comments).toEqual('User message');

    const emails = await getEmails();
    expect(emails.total).toBe(2);
    expect(emails.to(speaker.email)).toEqual([
      {
        name: event.name,
        address: 'no-reply@conference-hall.io',
        subject: `[${event.name}] Submission confirmed`,
      },
    ]);
    expect(emails.to(event.emailOrganizer)).toEqual([
      {
        name: event.name,
        address: 'no-reply@conference-hall.io',
        subject: `[${event.name}] New proposal received`,
      },
    ]);
  });

  it('can submit if more drafts than event max proposals', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'], attributes: { maxProposals: 1 } });
    const speaker = await userFactory();
    const talk1 = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk: talk1, traits: ['draft'] });
    const talk2 = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk: talk2, traits: ['draft'] });
    const data = { message: 'User message' };

    await submitProposal(talk2.id, event.slug, speaker.id, data);

    const result = await db.proposal.findUnique({ where: { id: proposal.id } });
    expect(result?.status).toEqual('SUBMITTED');
    expect(result?.comments).toEqual('User message');
  });

  it('throws an error when max proposal submitted reach', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'], attributes: { maxProposals: 1 } });
    const speaker = await userFactory();
    const talk1 = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk: talk1 });
    const talk2 = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk: talk2, traits: ['draft'] });
    const data = { message: 'User message' };

    await expect(submitProposal(talk2.id, event.slug, speaker.id, data)).rejects.toThrowError(
      MaxSubmittedProposalsReachedError,
    );
  });

  it('throws an error when talk not belong to the user', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk, traits: ['draft'] });
    const data = { message: 'User message' };

    const user = await userFactory();
    await expect(submitProposal(talk.id, event.slug, user.id, data)).rejects.toThrowError(ProposalNotFoundError);
  });

  it('throws an error when CFP is not open', async () => {
    const event = await eventFactory({ traits: ['conference-cfp-past'] });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const data = { message: 'User message' };

    await expect(submitProposal(talk.id, event.slug, speaker.id, data)).rejects.toThrowError(CfpNotOpenError);
  });

  it('throws an error when event not found', async () => {
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const data = { message: 'User message' };

    await expect(submitProposal(talk.id, 'XXX', speaker.id, data)).rejects.toThrowError(EventNotFoundError);
  });
});
