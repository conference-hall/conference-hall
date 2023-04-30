import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalsExportFiltersSchema } from '~/schemas/proposal';
import { requireSession } from '~/libs/auth/session';
import { exportProposals } from './server/export-proposals.server';

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireSession(request);
  const url = new URL(request.url);

  const result = await withZod(ProposalsExportFiltersSchema).validate(url.searchParams);
  if (result.error) return json(null);

  const { orga, event, ...filters } = result.data;
  const results = await exportProposals(event, userId, filters ?? {});
  return json(results);
};
