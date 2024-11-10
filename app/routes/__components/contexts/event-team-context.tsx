import type { SerializeFrom } from '@remix-run/node';
import { type ReactNode, createContext, useContext } from 'react';
import type { loader } from '~/routes/team+/$team.$event+/_layout.tsx';

type CurrentEvent = SerializeFrom<typeof loader>;

const EventTeamContext = createContext<CurrentEvent | undefined>(undefined);

type EventTeamProviderProps = {
  children: ReactNode;
  event: CurrentEvent;
};

export const CurrentEventTeamProvider = ({ children, event }: EventTeamProviderProps) => {
  return <EventTeamContext.Provider value={event}>{children}</EventTeamContext.Provider>;
};

/**
 * Returns the current event under the route "team+/$team.$event+"
 * @returns {CurrentEvent}
 */
export function useCurrentEvent(): CurrentEvent {
  const context = useContext(EventTeamContext);
  if (context === undefined) {
    throw new Error('useCurrentEvent must be used within a CurrentEventTeamProvider');
  }
  return context;
}
