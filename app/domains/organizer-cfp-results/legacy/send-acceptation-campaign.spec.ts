import type { Event, Team, User } from '@prisma/client';
import { resetEmails } from 'tests/email-helpers.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.ts';
import { ForbiddenOperationError } from '~/libs/errors.ts';

import { sendAcceptationCampaign } from './send-acceptation-campaign.server.ts';

describe.skip('#sendAcceptationCampaign', () => {
  let owner: User, member: User, reviewer: User, speaker1: User, speaker2: User;
  let team: Team;
  let event: Event, event2: Event;

  beforeEach(async () => {
    await resetEmails();
    owner = await userFactory();
    member = await userFactory();
    reviewer = await userFactory();
    speaker1 = await userFactory({ attributes: { email: 'speaker1@example.com' } });
    speaker2 = await userFactory({ attributes: { email: 'speaker2@example.com' } });
    team = await teamFactory({ owners: [owner], members: [member], reviewers: [reviewer] });
    event = await eventFactory({ team, attributes: { name: 'Event 1' } });
    event2 = await eventFactory({ attributes: { name: 'Event 2' } });
  });

  it('sends emails to only accepted (not draft) proposals of the event for each speaker', async () => {
    await proposalFactory({ event: event2, talk: await talkFactory({ speakers: [speaker1] }) });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1] }), traits: ['draft'] });
    await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1, speaker2], attributes: { title: 'Talk-1' } }),
      traits: ['accepted'],
    });
    await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1], attributes: { title: 'Talk-2' } }),
      traits: ['accepted'],
    });

    await sendAcceptationCampaign(event.slug, owner.id, []);

    await expect(speaker1.email).toHaveEmails([
      {
        from: { name: event.name, address: 'no-reply@conference-hall.io' },
        subject: `[${event.name}] Your talk has been accepted`,
      },
      {
        from: { name: event.name, address: 'no-reply@conference-hall.io' },
        subject: `[${event.name}] Your talk has been accepted`,
      },
    ]);

    await expect(speaker2.email).toHaveEmail({
      from: { name: event.name, address: 'no-reply@conference-hall.io' },
      subject: `[${event.name}] Your talk has been accepted`,
    });

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

    await sendAcceptationCampaign(event.slug, owner.id, [proposal_accepted_1.id]);

    await expect(speaker1.email).toHaveEmail({
      from: { name: event.name, address: 'no-reply@conference-hall.io' },
      subject: `[${event.name}] Your talk has been accepted`,
    });

    const proposals = await db.proposal.findMany({ orderBy: { emailAcceptedStatus: 'asc' } });
    expect(proposals.map((proposal) => proposal.emailAcceptedStatus)).toEqual(['SENT', null]);
  });

  it('can be sent by team members', async () => {
    await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1] }),
      traits: ['accepted'],
    });
    await sendAcceptationCampaign(event.slug, owner.id, []);

    await expect(speaker1.email).toHaveEmail({
      from: { name: event.name, address: 'no-reply@conference-hall.io' },
      subject: `[${event.name}] Your talk has been accepted`,
    });
  });

  it('cannot be sent by team reviewers', async () => {
    await expect(sendAcceptationCampaign(event.slug, reviewer.id, [])).rejects.toThrowError(ForbiddenOperationError);
  });
});