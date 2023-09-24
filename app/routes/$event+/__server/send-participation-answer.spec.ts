import { resetEmails } from 'tests/email-helpers.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.ts';
import { ProposalNotFoundError } from '~/libs/errors.ts';

import { sendParticipationAnswer } from './send-participation-answer.server.ts';

describe('#sendParticipationAnswer', () => {
  beforeEach(async () => {
    await resetEmails();
  });

  it('confirms a proposal', async () => {
    const event = await eventFactory({
      attributes: { name: 'Event 1', emailOrganizer: 'ben@email.com', emailNotifications: ['confirmed'] },
    });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk, traits: ['accepted'] });

    await sendParticipationAnswer(speaker.id, proposal.id, 'CONFIRMED');

    const proposalUpdated = await db.proposal.findUnique({
      where: { id: proposal.id },
    });

    expect(proposalUpdated?.status).toBe('CONFIRMED');

    await expect(event.emailOrganizer).toHaveEmail({
      from: { name: event.name, address: 'no-reply@conference-hall.io' },
      subject: `[${event.name}] Talk confirmed by speaker`,
    });
  });

  it('declines a proposal', async () => {
    const event = await eventFactory({
      attributes: { name: 'Event 1', emailOrganizer: 'ben@email.com', emailNotifications: ['declined'] },
    });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk, traits: ['accepted'] });

    await sendParticipationAnswer(speaker.id, proposal.id, 'DECLINED');

    const proposalUpdated = await db.proposal.findUnique({
      where: { id: proposal.id },
    });

    expect(proposalUpdated?.status).toBe('DECLINED');

    await expect(event.emailOrganizer).toHaveEmail({
      from: { name: event.name, address: 'no-reply@conference-hall.io' },
      subject: `[${event.name}] Talk declined by speaker`,
    });
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
