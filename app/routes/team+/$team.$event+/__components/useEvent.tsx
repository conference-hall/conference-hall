import { useOutletContext } from '@remix-run/react';

import type { EventData } from '~/.server/organizer-event-settings/UserEvent.ts';

export function useEvent() {
  return useOutletContext<{ event: EventData }>();
}
