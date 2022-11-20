import { disconnectDB, resetDB } from 'tests/db-helpers';
import { getEmails, resetEmails } from 'tests/email-helpers';
import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { db } from '../db';
import { ProposalNotFoundError } from '../errors';
import { sendParticipationAnswer } from './send-participation-answer.server';

describe('#sendParticipationAnswer', () => {
  beforeEach(async () => {
    await resetEmails();
    await resetDB();
  });
  afterEach(disconnectDB);

  it('confirms a proposal', async () => {
    const event = await eventFactory({
      attributes: { emailOrganizer: 'ben@email.com', emailNotifications: ['confirmed'] },
    });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk, traits: ['accepted'] });

    await sendParticipationAnswer(speaker.id, proposal.id, 'CONFIRMED');

    const proposalUpdated = await db.proposal.findUnique({
      where: { id: proposal.id },
    });

    expect(proposalUpdated?.status).toBe('CONFIRMED');

    const emails = await getEmails();
    expect(emails.total).toBe(1);
    expect(emails.to(event.emailOrganizer)).toEqual([
      {
        from: `${event.name} <no-reply@conference-hall.io>`,
        subject: `[${event.name}] Talk confirmed by speaker`,
      },
    ]);
  });

  it('declines a proposal', async () => {
    const event = await eventFactory({
      attributes: { emailOrganizer: 'ben@email.com', emailNotifications: ['declined'] },
    });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk, traits: ['accepted'] });

    await sendParticipationAnswer(speaker.id, proposal.id, 'DECLINED');

    const proposalUpdated = await db.proposal.findUnique({
      where: { id: proposal.id },
    });

    expect(proposalUpdated?.status).toBe('DECLINED');

    const emails = await getEmails();
    expect(emails.total).toBe(1);
    expect(emails.to(event.emailOrganizer)).toEqual([
      {
        from: `${event.name} <no-reply@conference-hall.io>`,
        subject: `[${event.name}] Talk declined by speaker`,
      },
    ]);
  });

  it('cannot confirm or declined a not accepted proposal', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk, traits: ['submitted'] });

    await sendParticipationAnswer(speaker.id, proposal.id, 'CONFIRMED');

    const proposalUpdated = await db.proposal.findUnique({
      where: { id: proposal.id },
    });

    expect(proposalUpdated?.status).toBe('SUBMITTED');
  });

  it('throws an error when proposal not found', async () => {
    const speaker = await userFactory();
    await expect(sendParticipationAnswer(speaker.id, 'XXX', 'CONFIRMED')).rejects.toThrowError(ProposalNotFoundError);
  });
});
