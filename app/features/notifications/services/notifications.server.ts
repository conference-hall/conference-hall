import { db } from '../../../../prisma/db.server.ts';

export class Notifications {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new Notifications(userId);
  }

  async unreadCount(): Promise<number> {
    return db.notification.count({
      where: { userId: this.userId, read: false },
    });
  }

  async list() {
    return db.notification.findMany({
      where: { userId: this.userId },
      include: {
        event: { select: { slug: true, name: true } },
        proposal: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await db.notification.updateMany({
      where: { id: notificationId, userId: this.userId },
      data: { read: true },
    });
  }

  async markAllAsRead(): Promise<void> {
    await db.notification.updateMany({
      where: { userId: this.userId, read: false },
      data: { read: true },
    });
  }
}
