import { useOutletContext } from '@remix-run/react';

import type { Team } from '~/.server/team/user-team';

export function useTeam() {
  return useOutletContext<{ team: Team }>();
}
