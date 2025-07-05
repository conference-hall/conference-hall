import { createContext, type ReactNode, useContext } from 'react';
import type { loader } from '~/features/event-management/layout.tsx';
import type { SerializeFrom } from '~/shared/types/react-router.types.ts';

// todo(folders): where to put this file?
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
 * Returns the current event under the route "/team/team.event-management"
 * @returns {CurrentEvent}
 */
export function useCurrentEvent(): CurrentEvent {
  const context = useContext(EventTeamContext);
  if (context === undefined) {
    throw new Error('useCurrentEvent must be used within a CurrentEventTeamProvider');
  }
  return context;
}
