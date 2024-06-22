import { useOutletContext } from '@remix-run/react';

import type { EventData } from '~/.server/event-settings/user-event';

export function useEvent() {
  return useOutletContext<{ event: EventData }>();
}
