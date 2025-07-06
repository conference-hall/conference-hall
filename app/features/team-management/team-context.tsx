import { createContext, type ReactNode, useContext } from 'react';
import type { SerializeFrom } from '~/shared/types/react-router.types.ts';
import type { loader } from './layout.tsx';

type CurrentTeam = SerializeFrom<typeof loader>;
type TeamProviderProps = { children: ReactNode; team: CurrentTeam };

const TeamContext = createContext<CurrentTeam | undefined>(undefined);

export const CurrentTeamProvider = ({ children, team }: TeamProviderProps) => {
  return <TeamContext.Provider value={team}>{children}</TeamContext.Provider>;
};

/**
 * Returns the current team
 * @returns {CurrentTeam}
 */
export function useCurrentTeam(): CurrentTeam {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useCurrentTeam must be used within a CurrentTeamProvider');
  }
  return context;
}
