import { eventFactory } from 'tests/factories/events.ts';
import { notificationFactory } from 'tests/factories/notifications.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import { db } from '../../../../prisma/db.server.ts';
import type { Event, User } from '../../../../prisma/generated/client.ts';
import { Notifications } from './notifications.server.ts';

describe('Notifications', () => {
  let speaker1: User;
  let speaker2: User;
  let event: Event;

  beforeEach(async () => {
    speaker1 = await userFactory();
    speaker2 = await userFactory();
    event = await eventFactory();
  });

  describe('unreadCount', () => {
    it('returns correct count for a user with mixed read/unread notifications', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1] }) });

      await notificationFactory({ user: speaker1, event, proposal });
      await notificationFactory({
        user: speaker1,
        event,
        proposal,
        attributes: { type: 'PROPOSAL_REJECTED', read: true },
      });
      await notificationFactory({ user: speaker1, event, proposal });

      const count = await Notifications.for(speaker1.id).unreadCount();
      expect(count).toEqual(2);
    });

    it('does not count notifications for other users', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1, speaker2] }) });

      await notificationFactory({ user: speaker1, event, proposal });
      await notificationFactory({ user: speaker2, event, proposal });

      const count = await Notifications.for(speaker1.id).unreadCount();
      expect(count).toEqual(1);
    });
  });

  describe('list', () => {
    it('returns notifications ordered by most recent with event and proposal data', async () => {
      const proposal1 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1] }) });
      const proposal2 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1] }) });

      await notificationFactory({
        user: speaker1,
        event,
        proposal: proposal1,
        attributes: { createdAt: new Date('2024-01-01') },
      });
      await notificationFactory({
        user: speaker1,
        event,
        proposal: proposal2,
        attributes: { type: 'PROPOSAL_REJECTED', createdAt: new Date('2024-01-02') },
      });

      const notifications = await Notifications.for(speaker1.id).list();

      expect(notifications).toHaveLength(2);
      expect(notifications[0].type).toBe('PROPOSAL_REJECTED');
      expect(notifications[0].proposal.title).toBe(proposal2.title);
      expect(notifications[0].event.slug).toBe(event.slug);
      expect(notifications[1].type).toBe('PROPOSAL_ACCEPTED');
      expect(notifications[1].proposal.title).toBe(proposal1.title);
    });

    it('does not return notifications for other users', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1, speaker2] }) });

      await notificationFactory({ user: speaker1, event, proposal });
      await notificationFactory({ user: speaker2, event, proposal });

      const notifications = await Notifications.for(speaker1.id).list();
      expect(notifications).toHaveLength(1);
    });
  });

  describe('markAsRead', () => {
    it('marks only the specified notification for the owning user', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1] }) });

      const notif1 = await notificationFactory({ user: speaker1, event, proposal });
      const notif2 = await notificationFactory({
        user: speaker1,
        event,
        proposal,
        attributes: { type: 'PROPOSAL_REJECTED' },
      });

      await Notifications.for(speaker1.id).markAsRead(notif1.id);

      const updated1 = await db.notification.findUnique({ where: { id: notif1.id } });
      const updated2 = await db.notification.findUnique({ where: { id: notif2.id } });
      expect(updated1?.read).toBe(true);
      expect(updated2?.read).toBe(false);
    });

    it('does not mark notifications owned by another user', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1, speaker2] }) });

      const otherNotif = await notificationFactory({ user: speaker2, event, proposal });

      await Notifications.for(speaker1.id).markAsRead(otherNotif.id);

      const notif = await db.notification.findUnique({ where: { id: otherNotif.id } });
      expect(notif?.read).toBe(false);
    });
  });

  describe('markAllAsRead', () => {
    it('marks all notifications for the owning user', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1] }) });

      await notificationFactory({ user: speaker1, event, proposal });
      await notificationFactory({ user: speaker1, event, proposal, attributes: { type: 'PROPOSAL_REJECTED' } });

      await Notifications.for(speaker1.id).markAllAsRead();

      const unread = await db.notification.count({ where: { userId: speaker1.id, read: false } });
      expect(unread).toEqual(0);
    });

    it('does not affect another user notifications', async () => {
      const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1, speaker2] }) });

      await notificationFactory({ user: speaker1, event, proposal });
      await notificationFactory({ user: speaker2, event, proposal });

      await Notifications.for(speaker1.id).markAllAsRead();

      const speaker2Unread = await db.notification.count({ where: { userId: speaker2.id, read: false } });
      expect(speaker2Unread).toEqual(1);
    });
  });
});
