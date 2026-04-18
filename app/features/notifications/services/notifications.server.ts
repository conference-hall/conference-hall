import { db } from '../../../../prisma/db.server.ts';
import type { NotificationType } from '../../../../prisma/generated/client.ts';

export type NotificationData = {
  eventSlug: string;
  eventName: string;
  proposalId: string;
  proposalTitle: string;
};

export type NotificationItem = {
  id: string;
  type: NotificationType;
  data: NotificationData;
  read: boolean;
  createdAt: Date;
};

export class Notifications {
  constructor(private userId: string) {}

  static for(userId: string): Notifications {
    return new Notifications(userId);
  }

  async unreadCount(): Promise<number> {
    return db.notification.count({
      where: { userId: this.userId, read: false },
    });
  }

  async list(): Promise<Array<NotificationItem>> {
    const rows = await db.notification.findMany({
      where: { userId: this.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      data: row.data as NotificationData,
      read: row.read,
      createdAt: row.createdAt,
    }));
  }

  async markRead(notificationId: string): Promise<void> {
    await db.notification.updateMany({
      where: { id: notificationId, userId: this.userId },
      data: { read: true },
    });
  }

  async markAllRead(): Promise<void> {
    await db.notification.updateMany({
      where: { userId: this.userId, read: false },
      data: { read: true },
    });
  }
}
