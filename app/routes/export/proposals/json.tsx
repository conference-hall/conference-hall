import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalsExportFiltersSchema } from '~/schemas/proposal';
import { sessionRequired } from '~/services/auth/auth.server';
import { mapErrorToResponse } from '~/services/errors';
import { exportProposalsFromFilters } from '~/services/organizers/event.server';

export const loader = async ({ request }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const url = new URL(request.url);

  const result = await withZod(ProposalsExportFiltersSchema).validate(url.searchParams);
  if (result.error) return json(null);

  const { orga, event, ...filters } = result.data;
  try {
    const results = await exportProposalsFromFilters(orga, event, uid, filters ?? {});
    return json(results);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};
