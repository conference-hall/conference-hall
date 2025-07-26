import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/autocomplete.ts';
import { Autocomplete, parseUrlFilters } from './services/autocomplete.server.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const filters = parseUrlFilters(request.url);

  const proposals = await Autocomplete.for(userId, params.team, params.event).searchProposals(filters);

  return { proposals };
};
