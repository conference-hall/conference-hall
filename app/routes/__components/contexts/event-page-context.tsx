import { type ReactNode, createContext, useContext } from 'react';
import type { loader } from '~/routes/$event+/_layout.tsx';
import type { SerializeFrom } from '~/types/remix.types.ts';

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
 * Returns the current event under the route "$event+"
 * @returns {CurrentEvent}
 */
export function useCurrentEvent(): CurrentEvent {
  const context = useContext(EventPageContext);
  if (context === undefined) {
    throw new Error('useCurrentEvent must be used within a CurrentEventPageProvider');
  }
  return context;
}
