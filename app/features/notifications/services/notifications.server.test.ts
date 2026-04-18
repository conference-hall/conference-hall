import { userFactory } from 'tests/factories/users.ts';
import { db } from '../../../../prisma/db.server.ts';
import type { User } from '../../../../prisma/generated/client.ts';
import { Notifications } from './notifications.server.ts';

describe('Notifications', () => {
  let speaker: User;

  beforeEach(async () => {
    speaker = await userFactory();
  });

  describe('unreadCount', () => {
    it('returns 0 when no notifications exist', async () => {
      const count = await Notifications.for(speaker.id).unreadCount();
      expect(count).toEqual(0);
    });

    it('counts only unread notifications', async () => {
      await db.notification.createMany({
        data: [
          { userId: speaker.id, type: 'PROPOSAL_ACCEPTED', data: notificationData(), read: false },
          { userId: speaker.id, type: 'PROPOSAL_SUBMITTED', data: notificationData(), read: false },
          { userId: speaker.id, type: 'PROPOSAL_REJECTED', data: notificationData(), read: true },
        ],
      });

      const count = await Notifications.for(speaker.id).unreadCount();
      expect(count).toEqual(2);
    });
  });

  describe('list', () => {
    it('returns notifications ordered by creation date desc', async () => {
      const n1 = await db.notification.create({
        data: {
          userId: speaker.id,
          type: 'PROPOSAL_SUBMITTED',
          data: notificationData({ proposalTitle: 'First' }),
          createdAt: new Date('2026-01-01'),
        },
      });
      const n2 = await db.notification.create({
        data: {
          userId: speaker.id,
          type: 'PROPOSAL_ACCEPTED',
          data: notificationData({ proposalTitle: 'Second' }),
          createdAt: new Date('2026-01-02'),
        },
      });

      const notifications = await Notifications.for(speaker.id).list();
      expect(notifications).toHaveLength(2);
      expect(notifications[0].id).toEqual(n2.id);
      expect(notifications[1].id).toEqual(n1.id);
    });

    it('returns empty array when no notifications exist', async () => {
      const notifications = await Notifications.for(speaker.id).list();
      expect(notifications).toEqual([]);
    });
  });

  describe('markRead', () => {
    it('marks a specific notification as read', async () => {
      const notification = await db.notification.create({
        data: { userId: speaker.id, type: 'PROPOSAL_ACCEPTED', data: notificationData() },
      });

      await Notifications.for(speaker.id).markRead(notification.id);

      const updated = await db.notification.findUnique({ where: { id: notification.id } });
      expect(updated?.read).toBe(true);
    });

    it('does not mark notifications of other users', async () => {
      const otherUser = await userFactory();
      const notification = await db.notification.create({
        data: { userId: otherUser.id, type: 'PROPOSAL_ACCEPTED', data: notificationData() },
      });

      await Notifications.for(speaker.id).markRead(notification.id);

      const updated = await db.notification.findUnique({ where: { id: notification.id } });
      expect(updated?.read).toBe(false);
    });
  });

  describe('markAllRead', () => {
    it('marks all unread notifications as read', async () => {
      await db.notification.createMany({
        data: [
          { userId: speaker.id, type: 'PROPOSAL_ACCEPTED', data: notificationData(), read: false },
          { userId: speaker.id, type: 'PROPOSAL_SUBMITTED', data: notificationData(), read: false },
        ],
      });

      await Notifications.for(speaker.id).markAllRead();

      const unread = await db.notification.count({ where: { userId: speaker.id, read: false } });
      expect(unread).toEqual(0);
    });
  });
});

function notificationData(overrides?: Partial<Record<string, string>>) {
  return {
    eventSlug: 'test-event',
    eventName: 'Test Event',
    proposalId: 'prop-1',
    proposalTitle: 'Test Proposal',
    ...overrides,
  };
}
