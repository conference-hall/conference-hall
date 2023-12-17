import { useOutletContext } from '@remix-run/react';

import type { Team } from '~/.server/organizer-team/UserTeam';

export function useTeam() {
  return useOutletContext<{ team: Team }>();
}
