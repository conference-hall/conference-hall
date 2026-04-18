import { job } from '~/shared/jobs/job.ts';
import { logger } from '~/shared/logger/logger.server.ts';
import { dispatchEmail } from '../channels/email.channel.server.ts';
import { dispatchInApp } from '../channels/in-app.channel.server.ts';
import type { NotificationEvent } from '../notification-events.server.ts';
import { resolveProposalEvent } from '../proposal-event.resolver.server.ts';

export const processNotification = job<NotificationEvent>({
  name: 'process-notification',
  queue: 'default',
  run: async (event: NotificationEvent) => {
    const resolved = await resolveProposalEvent(event);
    if (!resolved) return;

    for (const recipient of resolved.recipients) {
      const results = await Promise.allSettled([
        dispatchInApp(resolved, recipient),
        dispatchEmail(resolved, recipient),
      ]);

      for (const result of results) {
        if (result.status === 'rejected') {
          logger.error('Notification channel dispatch failed', {
            error: result.reason,
            eventType: event.type,
            userId: recipient.userId,
          });
        }
      }
    }
  },
});
