import type { ActionArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { mapErrorToResponse } from '~/services/errors';
import { rateProposal, validateRating } from '~/services/organizers/event.server';

export const action = async ({ request, params }: ActionArgs) => {
  const uid = await sessionRequired(request);
  try {
    const form = await request.formData();
    const data = validateRating(form);
    if (data) await rateProposal(params.slug!, params.eventSlug!, params.proposal!, uid, data);
    return null;
  } catch (e) {
    throw mapErrorToResponse(e);
  }
};
