import * as Sentry from '@sentry/remix';
import { useEffect } from 'react';

type SentryUser = {
  userId: string | undefined;
  enabled: boolean;
};

export function useSentryUser({ userId, enabled }: SentryUser) {
  useEffect(() => {
    if (!enabled) return;
    if (userId) {
      Sentry.setUser({ id: userId });
    } else {
      Sentry.setUser(null);
    }
  }, [enabled, userId]);
}
