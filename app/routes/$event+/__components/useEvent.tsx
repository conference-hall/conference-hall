import { useOutletContext } from '@remix-run/react';

import type { EventData } from '~/.server/event-page/EventPage.ts';

export function useEvent() {
  return useOutletContext<{ event: EventData }>();
}
