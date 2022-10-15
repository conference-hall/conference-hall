import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalsFiltersSchema } from '~/schemas/proposal';
import { sessionRequired } from '~/services/auth/auth.server';
import { mapErrorToResponse } from '~/services/errors';
import { exportProposalsFromFilters } from '~/services/organizers/event.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
  const url = new URL(request.url);
  const filters = await withZod(ProposalsFiltersSchema).validate(url.searchParams);

  try {
    const results = await exportProposalsFromFilters(params.slug!, params.eventSlug!, uid, filters.data ?? {});
    return json(results);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};
