import type { Event, Organization, User } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { getEmails, resetEmails } from 'tests/email-helpers';
import { eventFactory } from 'tests/factories/events';
import { organizationFactory } from 'tests/factories/organization';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { db } from '../db';
import { ForbiddenOperationError } from '../errors';
import { sendAcceptationCampaign, sendRejectionCampaign } from './emails-campaign.server';

describe('#sendAcceptationCampaign', () => {
  let owner: User, member: User, reviewer: User, speaker1: User, speaker2: User;
  let organization: Organization;
  let event: Event, event2: Event;

  beforeEach(async () => {
    await resetEmails();
    await resetDB();
    owner = await userFactory();
    member = await userFactory();
    reviewer = await userFactory();
    speaker1 = await userFactory({ attributes: { email: 'speaker1@example.com' } });
    speaker2 = await userFactory({ attributes: { email: 'speaker2@example.com' } });
    organization = await organizationFactory({ owners: [owner], members: [member], reviewers: [reviewer] });
    event = await eventFactory({ organization, attributes: { name: 'Event 1' } });
    event2 = await eventFactory({ attributes: { name: 'Event 2' } });
  });
  afterEach(disconnectDB);

  it('sends emails to only accepted (not draft) proposals of the event for each speaker', async () => {
    await proposalFactory({ event: event2, talk: await talkFactory({ speakers: [speaker1] }) });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1] }), traits: ['draft'] });

    const proposal_accepted_1 = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1, speaker2], attributes: { title: 'Talk-1' } }),
      traits: ['accepted'],
    });
    const proposal_accepted_2 = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1], attributes: { title: 'Talk-2' } }),
      traits: ['accepted'],
    });

    await sendAcceptationCampaign(organization.slug, event.slug, owner.id, []);

    const emails = await getEmails();
    expect(emails.total).toBe(3);

    expect(emails.hasEmailWithContent(speaker1.email, proposal_accepted_1.title)).toBeTruthy();
    expect(emails.hasEmailWithContent(speaker1.email, proposal_accepted_2.title)).toBeTruthy();
    expect(emails.to(speaker1.email)).toEqual([
      {
        from: `${event.name} <no-reply@conference-hall.io>`,
        subject: `[${event.name}] Your talk has been accepted`,
      },
      {
        from: `${event.name} <no-reply@conference-hall.io>`,
        subject: `[${event.name}] Your talk has been accepted`,
      },
    ]);

    expect(emails.hasEmailWithContent(speaker2.email, proposal_accepted_1.title)).toBeTruthy();
    expect(emails.to(speaker2.email)).toEqual([
      {
        from: `${event.name} <no-reply@conference-hall.io>`,
        subject: `[${event.name}] Your talk has been accepted`,
      },
    ]);

    const proposals = await db.proposal.findMany({ orderBy: { emailAcceptedStatus: 'asc' } });
    expect(proposals.map((proposal) => proposal.emailAcceptedStatus)).toEqual(['SENT', 'SENT', null, null]);
  });

  it('sends emails to selected proposals', async () => {
    const proposal_accepted_1 = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1], attributes: { title: 'Talk-1' } }),
      traits: ['accepted'],
    });
    await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker2], attributes: { title: 'Talk-2' } }),
      traits: ['accepted'],
    });

    await sendAcceptationCampaign(organization.slug, event.slug, owner.id, [proposal_accepted_1.id]);

    const emails = await getEmails();
    expect(emails.total).toBe(1);
    expect(emails.hasEmailWithContent(speaker1.email, proposal_accepted_1.title)).toBeTruthy();
    expect(emails.to(speaker1.email)).toEqual([
      {
        from: `${event.name} <no-reply@conference-hall.io>`,
        subject: `[${event.name}] Your talk has been accepted`,
      },
    ]);

    const proposals = await db.proposal.findMany({ orderBy: { emailAcceptedStatus: 'asc' } });
    expect(proposals.map((proposal) => proposal.emailAcceptedStatus)).toEqual(['SENT', null]);
  });

  it('can be sent by organization members', async () => {
    await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1] }),
      traits: ['accepted'],
    });
    await sendAcceptationCampaign(organization.slug, event.slug, owner.id, []);

    const emails = await getEmails();
    expect(emails.total).toBe(1);
  });

  it('cannot be sent by organization reviewers', async () => {
    await expect(sendAcceptationCampaign(organization.slug, event.slug, reviewer.id, [])).rejects.toThrowError(
      ForbiddenOperationError
    );
  });
});

describe('#sendRejectionCampaign', () => {
  let owner: User, member: User, reviewer: User, speaker1: User, speaker2: User;
  let organization: Organization;
  let event: Event, event2: Event;

  beforeEach(async () => {
    await resetEmails();
    await resetDB();
    owner = await userFactory();
    member = await userFactory();
    reviewer = await userFactory();
    speaker1 = await userFactory({ attributes: { email: 'speaker1@example.com' } });
    speaker2 = await userFactory({ attributes: { email: 'speaker2@example.com' } });
    organization = await organizationFactory({ owners: [owner], members: [member], reviewers: [reviewer] });
    event = await eventFactory({ organization, attributes: { name: 'Event 1' } });
    event2 = await eventFactory({ attributes: { name: 'Event 2' } });
  });
  afterEach(disconnectDB);

  it('sends emails to only rejected (not draft) proposals of the event for each speaker', async () => {
    await proposalFactory({ event: event2, talk: await talkFactory({ speakers: [speaker1] }) });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1] }), traits: ['draft'] });

    const proposal_rejected_1 = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1, speaker2], attributes: { title: 'Talk-1' } }),
      traits: ['rejected'],
    });
    const proposal_rejected_2 = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1], attributes: { title: 'Talk-2' } }),
      traits: ['rejected'],
    });

    await sendRejectionCampaign(organization.slug, event.slug, owner.id, []);

    const emails = await getEmails();
    expect(emails.total).toBe(3);

    expect(emails.hasEmailWithContent(speaker1.email, proposal_rejected_1.title)).toBeTruthy();
    expect(emails.hasEmailWithContent(speaker1.email, proposal_rejected_2.title)).toBeTruthy();
    expect(emails.to(speaker1.email)).toEqual([
      {
        from: `${event.name} <no-reply@conference-hall.io>`,
        subject: `[${event.name}] Your talk has been declined`,
      },
      {
        from: `${event.name} <no-reply@conference-hall.io>`,
        subject: `[${event.name}] Your talk has been declined`,
      },
    ]);

    expect(emails.hasEmailWithContent(speaker2.email, proposal_rejected_1.title)).toBeTruthy();
    expect(emails.to(speaker2.email)).toEqual([
      {
        from: `${event.name} <no-reply@conference-hall.io>`,
        subject: `[${event.name}] Your talk has been declined`,
      },
    ]);

    const proposals = await db.proposal.findMany({ orderBy: { emailRejectedStatus: 'asc' } });
    expect(proposals.map((proposal) => proposal.emailRejectedStatus)).toEqual(['SENT', 'SENT', null, null]);
  });

  it('sends emails to selected proposals', async () => {
    const proposal_rejected_1 = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1], attributes: { title: 'Talk-1' } }),
      traits: ['rejected'],
    });
    await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker2], attributes: { title: 'Talk-2' } }),
      traits: ['rejected'],
    });

    await sendRejectionCampaign(organization.slug, event.slug, owner.id, [proposal_rejected_1.id]);

    const emails = await getEmails();
    expect(emails.total).toBe(1);
    expect(emails.hasEmailWithContent(speaker1.email, proposal_rejected_1.title)).toBeTruthy();
    expect(emails.to(speaker1.email)).toEqual([
      {
        from: `${event.name} <no-reply@conference-hall.io>`,
        subject: `[${event.name}] Your talk has been declined`,
      },
    ]);

    const proposals = await db.proposal.findMany({ orderBy: { emailRejectedStatus: 'asc' } });
    expect(proposals.map((proposal) => proposal.emailRejectedStatus)).toEqual(['SENT', null]);
  });

  it('can be sent by organization members', async () => {
    await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1] }),
      traits: ['rejected'],
    });
    await sendRejectionCampaign(organization.slug, event.slug, owner.id, []);

    const emails = await getEmails();
    expect(emails.total).toBe(1);
  });

  it('cannot be sent by organization reviewers', async () => {
    await expect(sendRejectionCampaign(organization.slug, event.slug, reviewer.id, [])).rejects.toThrowError(
      ForbiddenOperationError
    );
  });
});
