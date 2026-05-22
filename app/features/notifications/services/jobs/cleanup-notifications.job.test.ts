import { eventFactory } from 'tests/factories/events.ts';
import { notificationFactory } from 'tests/factories/notifications.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { cleanupNotifications } from './cleanup-notifications.job.ts';

describe('cleanupNotifications job', () => {
  it('deletes read notifications older than 90 days', async () => {
    const user = await userFactory();
    const event = await eventFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });

    await notificationFactory({ user, event, proposal, attributes: { read: true, createdAt: new Date('2023-01-01') } });

    await cleanupNotifications.config.run(undefined);

    const remaining = await db.notification.count({ where: { userId: user.id } });
    expect(remaining).toBe(0);
  });

  it('does not delete unread notifications regardless of age', async () => {
    const user = await userFactory();
    const event = await eventFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });

    await notificationFactory({
      user,
      event,
      proposal,
      attributes: { read: false, createdAt: new Date('2023-01-01') },
    });

    await cleanupNotifications.config.run(undefined);

    const remaining = await db.notification.count({ where: { userId: user.id } });
    expect(remaining).toBe(1);
  });

  it('does not delete read notifications younger than 90 days', async () => {
    const user = await userFactory();
    const event = await eventFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });

    await notificationFactory({ user, event, proposal, attributes: { read: true, createdAt: new Date() } });

    await cleanupNotifications.config.run(undefined);

    const remaining = await db.notification.count({ where: { userId: user.id } });
    expect(remaining).toBe(1);
  });
});
