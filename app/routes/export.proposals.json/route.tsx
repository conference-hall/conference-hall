import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalsExportFiltersSchema } from '~/schemas/proposal';
import { requireSession } from '~/libs/auth/cookies';
import { mapErrorToResponse } from '~/libs/errors';
import { exportProposals } from './server/export-proposals.server';

export const loader = async ({ request }: LoaderArgs) => {
  const { uid } = await requireSession(request);
  const url = new URL(request.url);

  const result = await withZod(ProposalsExportFiltersSchema).validate(url.searchParams);
  if (result.error) return json(null);

  const { orga, event, ...filters } = result.data;
  try {
    const results = await exportProposals(orga, event, uid, filters ?? {});
    return json(results);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};
