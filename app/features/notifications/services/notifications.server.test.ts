import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import type { Event, Proposal, User } from '../../../../prisma/generated/client.ts';
import { Notifications } from './notifications.server.ts';

describe('Notifications', () => {
  let speaker1: User;
  let speaker2: User;
  let event: Event;
  let proposal: Proposal;

  beforeEach(async () => {
    speaker1 = await userFactory();
    speaker2 = await userFactory();
    event = await eventFactory();
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1] }), traits: ['accepted'] });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1] }), traits: ['draft'] });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker2] }), traits: ['accepted'] });

    await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1] }),
      traits: ['confirmed'],
    });
    await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1] }),
      traits: ['declined'],
    });
    await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1] }),
      traits: ['rejected-published'],
    });
    proposal = await proposalFactory({
      event,
      talk: await talkFactory({ speakers: [speaker1] }),
      traits: ['accepted-published'],
    });
  });

  describe('unreadCount', () => {
    it('retrieves unread notifications count', async () => {
      const unreadCount = await Notifications.for(speaker1.id).unreadCount();
      expect(unreadCount).toEqual(1);
    });
  });

  describe('list', () => {
    it("returns  accepted proposals as user's notifications", async () => {
      const notifications = await Notifications.for(speaker1.id).list();

      expect(notifications).toEqual([
        {
          type: 'ACCEPTED_PROPOSAL',
          proposal: {
            id: proposal.id,
            title: proposal.title,
          },
          event: {
            slug: event.slug,
            name: event.name,
          },
          date: proposal.updatedAt,
        },
      ]);
    });
  });
});
