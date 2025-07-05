import { createContext, type ReactNode, useContext } from 'react';
import type { loader } from '~/features/event-participation/layout.tsx';
import type { SerializeFrom } from '~/shared/types/react-router.types.ts';

type CurrentEvent = SerializeFrom<typeof loader>;

const EventPageContext = createContext<CurrentEvent | undefined>(undefined);

type EventPageProviderProps = {
  children: ReactNode;
  event: CurrentEvent;
};

export const CurrentEventPageProvider = ({ children, event }: EventPageProviderProps) => {
  return <EventPageContext.Provider value={event}>{children}</EventPageContext.Provider>;
};

/**
 * Returns the current event under the route "/$event"
 * @returns {CurrentEvent}
 */
export function useCurrentEvent(): CurrentEvent {
  const context = useContext(EventPageContext);
  if (context === undefined) {
    throw new Error('useCurrentEvent must be used within a CurrentEventPageProvider');
  }
  return context;
}
