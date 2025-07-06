import { createContext, type ReactNode, useContext } from 'react';
import type { loader } from '~/features/event-management/layout.tsx';
import type { SerializeFrom } from '~/shared/types/react-router.types.ts';

type CurrentEventTeam = SerializeFrom<typeof loader>;
type EventTeamProviderProps = { children: ReactNode; value: CurrentEventTeam };

const EventTeamContext = createContext<CurrentEventTeam | undefined>(undefined);

export const CurrentEventTeamProvider = ({ children, value }: EventTeamProviderProps) => {
  return <EventTeamContext.Provider value={value}>{children}</EventTeamContext.Provider>;
};

/**
 * Returns the current team and event
 * @returns {CurrentEventTeam}
 */
export function useCurrentEventTeam(): CurrentEventTeam {
  const context = useContext(EventTeamContext);
  if (context === undefined) {
    throw new Error('useCurrentEventTeam must be used within a CurrentEventTeamProvider');
  }
  return context;
}
