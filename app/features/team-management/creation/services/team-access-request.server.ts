import { db } from '../../../../../prisma/db.server.ts';

export class TeamAccessRequest {
  static async submit(data: { eventName: string; email: string }): Promise<void> {
    const { eventName, email } = data;

    const existing = await db.teamAccessRequest.findFirst({
      where: { email, status: 'PENDING' },
    });

    if (existing) {
      await db.teamAccessRequest.update({
        where: { id: existing.id },
        data: { eventName },
      });
      return;
    }

    await db.teamAccessRequest.create({
      data: { eventName, email },
    });
  }
}
