import { useOutletContext } from '@remix-run/react';

import type { Team } from '~/.server/team/UserTeam';

export function useTeam() {
  return useOutletContext<{ team: Team }>();
}
