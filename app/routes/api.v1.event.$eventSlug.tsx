import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { errorMessagesForSchema, inputFromUrl } from 'domain-functions';
import { EventProposalsApiSchema, getEventProposals } from '~/services/api/get-event-proposals.server';
import { fromErrors } from '~/libs/errors';

export const loader = async ({ request, params }: LoaderArgs) => {
  const result = await getEventProposals({
    ...params,
    ...inputFromUrl(request),
  });

  if (result.success) {
    return json(result.data);
  }

  if (result.errors.length > 0) {
    throw fromErrors(result);
  }

  if (result.inputErrors.length > 0) {
    const errors = errorMessagesForSchema(result.inputErrors, EventProposalsApiSchema);
    throw new Response(JSON.stringify(errors), { status: 400 });
  }
};
