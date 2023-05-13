import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { requireSession } from '~/libs/auth/session';
import { ProposalsExportFiltersSchema } from '~/schemas/proposal';

import { exportProposals } from './server/export-proposals.server';

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireSession(request);
  const url = new URL(request.url);

  const result = ProposalsExportFiltersSchema.safeParse(Object.fromEntries(url.searchParams));
  if (!result.success) return json(null);

  const { team, event, ...filters } = result.data;
  const results = await exportProposals(event, userId, filters ?? {});
  return json(results);
};
