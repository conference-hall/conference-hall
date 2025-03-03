import { type ReactNode, createContext, useContext } from 'react';
import type { loader } from '~/routes/team+/$team.tsx';
import type { SerializeFrom } from '~/types/react-router.types.ts';

type CurrentTeam = SerializeFrom<typeof loader>;

const TeamContext = createContext<CurrentTeam | undefined>(undefined);

type TeamProviderProps = {
  children: ReactNode;
  team: CurrentTeam;
};

export const CurrentTeamProvider = ({ children, team }: TeamProviderProps) => {
  return <TeamContext.Provider value={team}>{children}</TeamContext.Provider>;
};

/**
 * Returns the current tean under the route "team+/$team"
 * @returns {CurrentTeam}
 */
export function useCurrentTeam(): CurrentTeam {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useCurrentTeam must be used within a CurrentTeamProvider');
  }
  return context;
}
