import { useOutletContext } from '@remix-run/react';

import type { EventData } from '~/.server/event-page/event-page';

export function useEvent() {
  return useOutletContext<{ event: EventData }>();
}
